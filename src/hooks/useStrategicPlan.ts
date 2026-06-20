import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  StrategicPlan,
  SWOTItem,
  StrategicOption,
  BSCObjective,
  KPI,
  PAP,
  CLDNode,
  CLDLink,
  CLDSnapshot,
  loadFromStorage,
  saveToStorage,
  createEmptyPlan,
  createSamplePlan,
  generateId,
} from '@/lib/strategicPlanStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ── Sync types ────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';

interface SyncConflict {
  planId: string;
  localVersion: number;
  serverVersion: number;
  localUpdatedAt: string;
  serverUpdatedAt: string;
  localPlan: StrategicPlan;
  serverPlan: StrategicPlan;
}

// ── Realtime collaboration types ──────────────────────────
export interface PresenceUser {
  user_id: string;
  user_name: string;
  user_email?: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface CursorPosition {
  x: number;
  y: number;
  user_id: string;
  user_name: string;
  color: string;
  timestamp: number;
}

// Edge Function endpoint (set via env var in production)
const SYNC_API_URL =
  'https://paibpwwszlfpsyytdnal.databasepad.com/functions/v1/strategic-planner-sync';

// ─────────────────────────────────────────────────────────
export const useStrategicPlan = () => {
  const { user, session, isAuthenticated, isLoading: authLoading } = useAuth();

  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [currentPlan, setCurrentPlanState] = useState<StrategicPlan | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [unsyncedChanges, setUnsyncedChanges] = useState(false);

  // Realtime collaboration state
  const [presenceUsers, setPresenceUsers] = useState<Record<string, PresenceUser[]>>({});
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});

  // Sync management refs
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialSyncDone = useRef(false);
  const isSyncingRef = useRef(false);

  // Realtime channel refs
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const cursorThrottleRef = useRef(0);

  // ── Helpers ──────────────────────────────────────────────
  const stringToColor = useCallback((str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }, []);

  const normalizeRow = useCallback(<T extends Record<string, any>>(row: any): T => {
    if (!row || typeof row !== 'object') return row;
    const normalized: any = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      normalized[camelKey] = value;
    }
    return normalized as T;
  }, []);

  // ── API helper functions ────────────────────────────────
  const getAuthHeaders = useCallback(() => {
    if (!session?.access_token) {
      throw new Error('No valid session for sync');
    }
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }, [session]);

  const fetchServerState = useCallback(async () => {
    try {
      const response = await fetch(SYNC_API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        console.warn('Session expired during sync');
        return { success: false, unauthorized: true };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Fetch server state failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }, [getAuthHeaders]);

  const saveStateToServer = useCallback(
    async (plansToSave: StrategicPlan[], currentPlanId: string | null) => {
      try {
        const response = await fetch(SYNC_API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ plans: plansToSave, currentPlanId }),
        });

        if (response.status === 401) {
          return { success: false, unauthorized: true };
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Save failed' }));
          throw new Error(error.message || `HTTP ${response.status}`);
        }

        await response.json();
        return { success: true };
      } catch (error) {
        console.error('Save state failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        };
      }
    },
    [getAuthHeaders]
  );

  const deletePlanOnServer = useCallback(
    async (planId: string) => {
      try {
        const url = `${SYNC_API_URL}?plan_id=${encodeURIComponent(planId)}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.status === 401) return { success: false, unauthorized: true };
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return { success: true };
      } catch (error) {
        console.error('Delete plan failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        };
      }
    },
    [getAuthHeaders]
  );

  // ── Conflict resolution ────────────────────────────────
  const resolveConflicts = useCallback(
    (
      localPlans: StrategicPlan[],
      serverPlans: StrategicPlan[]
    ): { plans: StrategicPlan[]; conflicts: SyncConflict[] } => {
      const detectedConflicts: SyncConflict[] = [];
      const mergedPlans = [...serverPlans];
      const serverPlanMap = new Map(serverPlans.map((p) => [p.id, p]));

      localPlans.forEach((localPlan) => {
        const serverPlan = serverPlanMap.get(localPlan.id);

        if (serverPlan) {
          const localTime = new Date(localPlan.updatedAt).getTime();
          const serverTime = new Date(serverPlan.updatedAt).getTime();

          if (localTime > serverTime) {
            detectedConflicts.push({
              planId: localPlan.id,
              localVersion: localPlan.version ?? 1,
              serverVersion: serverPlan.version ?? 1,
              localUpdatedAt: localPlan.updatedAt,
              serverUpdatedAt: serverPlan.updatedAt,
              localPlan,
              serverPlan,
            });
          }
        } else {
          // Plan exists locally but not on server — include it
          mergedPlans.push(localPlan);
        }
      });

      return { plans: mergedPlans, conflicts: detectedConflicts };
    },
    []
  );

  // ── Sync logic ─────────────────────────────────────────
  const syncLocalChanges = useCallback(async () => {
    if (!isAuthenticated || !isOnline || isSyncingRef.current || !unsyncedChanges) return;

    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const result = await saveStateToServer(plans, currentPlan?.id ?? null);

      if (result.unauthorized) {
        setSyncStatus('error');
        return;
      }

      if (result.success) {
        setLastSynced(new Date().toISOString());
        setSyncStatus('success');
        setUnsyncedChanges(false);
      } else {
        throw new Error(result.error ?? 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated, isOnline, unsyncedChanges, plans, currentPlan, saveStateToServer]);

  const performInitialSync = useCallback(async () => {
    if (!isAuthenticated || authLoading || isInitialSyncDone.current || isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const result = await fetchServerState();

      if (result.unauthorized) {
        setSyncStatus('error');
        return;
      }

      if (result.success && result.data) {
        const { plans: serverPlans, currentPlanId: serverCurrentPlanId } = result.data;

        setPlans((localPlans) => {
          const { plans: mergedPlans, conflicts: detectedConflicts } = resolveConflicts(
            localPlans,
            serverPlans
          );

          if (detectedConflicts.length > 0) {
            setConflicts(detectedConflicts);
            setSyncStatus('conflict');
            return localPlans; // hold until user resolves
          }

          if (serverCurrentPlanId) {
            const newCurrent = mergedPlans.find((p) => p.id === serverCurrentPlanId);
            setCurrentPlanState(newCurrent ?? null);
          }

          setLastSynced(new Date().toISOString());
          setSyncStatus('success');
          saveToStorage(mergedPlans, serverCurrentPlanId ?? null);
          setUnsyncedChanges(false);
          return mergedPlans;
        });
      } else {
        // Nothing on server yet — push local state up
        await syncLocalChanges();
      }

      isInitialSyncDone.current = true;
    } catch (error) {
      console.error('Initial sync failed:', error);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated, authLoading, fetchServerState, resolveConflicts, syncLocalChanges]);

  const resolveConflict = useCallback(
    async (planId: string, resolution: 'local' | 'server' | 'merge') => {
      const conflict = conflicts.find((c) => c.planId === planId);
      if (!conflict) return;

      setConflicts((prev) => prev.filter((c) => c.planId !== planId));

      setPlans((prev) => {
        let updatedPlans = [...prev];

        if (resolution === 'local') {
          updatedPlans = updatedPlans.map((p) =>
            p.id === planId ? conflict.localPlan : p
          );
        } else if (resolution === 'server') {
          updatedPlans = updatedPlans.map((p) =>
            p.id === planId ? conflict.serverPlan : p
          );
        } else {
          // merge — union of items by id; server metadata wins for scalar fields
          const merged: StrategicPlan = {
            ...conflict.serverPlan,
            swotItems: [
              ...conflict.serverPlan.swotItems,
              ...conflict.localPlan.swotItems.filter(
                (li) => !conflict.serverPlan.swotItems.some((si) => si.id === li.id)
              ),
            ],
            strategicOptions: [
              ...conflict.serverPlan.strategicOptions,
              ...conflict.localPlan.strategicOptions.filter(
                (lo) => !conflict.serverPlan.strategicOptions.some((so) => so.id === lo.id)
              ),
            ],
            objectives: [
              ...conflict.serverPlan.objectives,
              ...conflict.localPlan.objectives.filter(
                (lo) => !conflict.serverPlan.objectives.some((so) => so.id === lo.id)
              ),
            ],
            paps: [
              ...conflict.serverPlan.paps,
              ...conflict.localPlan.paps.filter(
                (lp) => !conflict.serverPlan.paps.some((sp) => sp.id === lp.id)
              ),
            ],
            // Merge CLD snapshots — server first, then local-only ones
            cldSnapshots: [
              ...(conflict.serverPlan.cldSnapshots ?? []),
              ...(conflict.localPlan.cldSnapshots ?? []).filter(
                (ls) =>
                  !(conflict.serverPlan.cldSnapshots ?? []).some((ss) => ss.id === ls.id)
              ),
            ],
            // Applied archetypes — union (deduped)
            appliedArchetypes: Array.from(
              new Set([
                ...(conflict.serverPlan.appliedArchetypes ?? []),
                ...(conflict.localPlan.appliedArchetypes ?? []),
              ])
            ),
            updatedAt: new Date().toISOString(),
            version: (conflict.serverPlan.version ?? 1) + 1,
          };
          updatedPlans = updatedPlans.map((p) => (p.id === planId ? merged : p));
        }

        return updatedPlans;
      });

      setUnsyncedChanges(true);

      setConflicts((prev) => {
        if (prev.length === 0) setSyncStatus('success');
        return prev;
      });
    },
    [conflicts]
  );

  const clearConflicts = useCallback(() => {
    setConflicts([]);
    setSyncStatus((s) => (s === 'conflict' ? 'success' : s));
  }, []);

  // ── Realtime channel ───────────────────────────────────
  const mergeRemoteUpdate = useCallback(
    (transform: (plan: StrategicPlan) => StrategicPlan): void => {
      if (!currentPlan) return;
      const updatedPlan = transform({
        ...currentPlan,
        updatedAt: new Date().toISOString(),
      });
      setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      setCurrentPlanState(updatedPlan);
    },
    [currentPlan]
  );

  const handleTableChange = useCallback(
    (planKey: keyof StrategicPlan, payload: RealtimePostgresChangesPayload<any>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      mergeRemoteUpdate((plan) => {
        const items = (plan[planKey] as any[]) || [];
        let updatedItems = items;

        if (eventType === 'INSERT') {
          const normalized = normalizeRow(newRecord);
          if (!items.find((i: any) => i.id === normalized.id)) {
            updatedItems = [...items, normalized];
          }
        } else if (eventType === 'UPDATE') {
          const normalized = normalizeRow(newRecord);
          updatedItems = items.map((i: any) =>
            i.id === normalized.id ? { ...i, ...normalized } : i
          );
        } else if (eventType === 'DELETE') {
          updatedItems = items.filter((i: any) => i.id !== oldRecord.id);
        }

        return { ...plan, [planKey]: updatedItems };
      });
    },
    [mergeRemoteUpdate, normalizeRow]
  );

  const handleKpiChange = useCallback(
    (payload: RealtimePostgresChangesPayload<any>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      const normalized = normalizeRow<KPI>(newRecord);

      mergeRemoteUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.map((obj) => {
          if (obj.id !== normalized.objectiveId) return obj;

          let kpis = obj.kpis;
          if (eventType === 'INSERT') {
            if (!kpis.find((k) => k.id === normalized.id)) {
              kpis = [...kpis, normalized];
            }
          } else if (eventType === 'UPDATE') {
            kpis = kpis.map((k) => (k.id === normalized.id ? { ...k, ...normalized } : k));
          } else if (eventType === 'DELETE') {
            kpis = kpis.filter((k) => k.id !== oldRecord.id);
          }
          return { ...obj, kpis };
        }),
      }));
    },
    [mergeRemoteUpdate, normalizeRow]
  );

  const setupRealtimeChannel = useCallback(
    (planId: string) => {
      if (!planId || !user?.id) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase.channel(`plan:${planId}`, {
        config: {
          presence: { key: user.id },
        },
      });

      // Presence sync
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceUsers(state as Record<string, PresenceUser[]>);
      });

      // Postgres changes — swot_items
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'swot_items', filter: `plan_id=eq.${planId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          isRemoteUpdateRef.current = true;
          handleTableChange('swotItems', payload);
          setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
        }
      );

      // Postgres changes — strategic_options
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'strategic_options', filter: `plan_id=eq.${planId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          isRemoteUpdateRef.current = true;
          handleTableChange('strategicOptions', payload);
          setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
        }
      );

      // Postgres changes — paps
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paps', filter: `plan_id=eq.${planId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          isRemoteUpdateRef.current = true;
          handleTableChange('paps', payload);
          setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
        }
      );

      // Postgres changes — kpis (nested in objectives)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kpis', filter: `plan_id=eq.${planId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          isRemoteUpdateRef.current = true;
          handleKpiChange(payload);
          setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
        }
      );

      // Broadcast listeners for immediate peer updates
      channel.on('broadcast', { event: 'swot_change' }, (payload: any) => {
        if (isRemoteUpdateRef.current) return;
        const { type, data } = payload.payload;
        handleTableChange('swotItems', { eventType: type, new: data, old: data } as any);
      });

      channel.on('broadcast', { event: 'strategic_option_change' }, (payload: any) => {
        if (isRemoteUpdateRef.current) return;
        const { type, data } = payload.payload;
        handleTableChange('strategicOptions', { eventType: type, new: data, old: data } as any);
      });

      channel.on('broadcast', { event: 'pap_change' }, (payload: any) => {
        if (isRemoteUpdateRef.current) return;
        const { type, data } = payload.payload;
        handleTableChange('paps', { eventType: type, new: data, old: data } as any);
      });

      channel.on('broadcast', { event: 'kpi_change' }, (payload: any) => {
        if (isRemoteUpdateRef.current) return;
        const { type, data } = payload.payload;
        handleKpiChange({ eventType: type, new: data, old: data } as any);
      });

      // Cursor broadcast
      channel.on('broadcast', { event: 'cursor' }, (payload: any) => {
        const data = payload.payload as CursorPosition;
        if (data.user_id !== user.id) {
          setCursors((prev) => ({
            ...prev,
            [data.user_id]: { ...data, timestamp: Date.now() },
          }));
        }
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            user_name: user.user_metadata?.name || user.email || 'User',
            user_email: user.email,
            color: stringToColor(user.id),
          });
        }
      });

      channelRef.current = channel;

      return () => {
        supabase.removeChannel(channel);
        channelRef.current = null;
      };
    },
    [user, handleTableChange, handleKpiChange, stringToColor]
  );

  const updateCursor = useCallback(
    (x: number, y: number) => {
      if (!channelRef.current || !user?.id) return;
      const now = Date.now();
      if (now - cursorThrottleRef.current < 50) return;
      cursorThrottleRef.current = now;

      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          x,
          y,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email || 'User',
          color: stringToColor(user.id),
        },
      });
    },
    [user, stringToColor]
  );

  const broadcastChange = useCallback(
    (event: string, payload: any) => {
      if (!channelRef.current || isRemoteUpdateRef.current) return;
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    []
  );

  // ── Effects ────────────────────────────────────────────

  // Online / offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (unsyncedChanges && isAuthenticated) syncLocalChanges();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [unsyncedChanges, isAuthenticated, syncLocalChanges]);

  // Load from local storage on mount
  useEffect(() => {
    const { plans: storedPlans, currentPlanId } = loadFromStorage();

    if (storedPlans.length > 0) {
      setPlans(storedPlans);
      if (currentPlanId) {
        const plan = storedPlans.find((p) => p.id === currentPlanId);
        setCurrentPlanState(plan ?? null);
      }
    } else {
      const samplePlan = createSamplePlan();
      setPlans([samplePlan]);
      setCurrentPlanState(samplePlan);
      saveToStorage([samplePlan], samplePlan.id);
    }

    setIsLoading(false);
  }, []);

  // Initial cloud sync once authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !isInitialSyncDone.current) {
      performInitialSync();
    }
  }, [isAuthenticated, authLoading, performInitialSync]);

  // Persist to local storage whenever plans change
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(plans, currentPlan?.id ?? null);
    }
  }, [plans, currentPlan, isLoading]);

  // Mark unsynced when plans change (after initial sync is done)
  useEffect(() => {
    if (!isLoading && isAuthenticated && isInitialSyncDone.current) {
      setUnsyncedChanges(true);
    }
  }, [plans, currentPlan, isLoading, isAuthenticated]);

  // Debounced auto-sync — 2 s after last change
  useEffect(() => {
    if (!unsyncedChanges || !isAuthenticated || !isOnline || !isInitialSyncDone.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncLocalChanges();
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [unsyncedChanges, isAuthenticated, isOnline, syncLocalChanges]);

  // Setup realtime channel when current plan changes
  useEffect(() => {
    if (!currentPlan?.id || !isAuthenticated) return;
    const cleanup = setupRealtimeChannel(currentPlan.id);
    return () => {
      if (cleanup) cleanup();
    };
  }, [currentPlan?.id, isAuthenticated, setupRealtimeChannel]);

  // Cleanup stale cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const next: Record<string, CursorPosition> = {};
        for (const [key, cursor] of Object.entries(prev)) {
          if (now - cursor.timestamp < 30000) {
            next[key] = cursor;
          }
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Generic plan updater ───────────────────────────────
  /**
   * Applies a transform function to the current plan and synchronises
   * the result into both `plans` state and `currentPlan` state.
   * All domain-level mutations go through this so there is a single
   * code path for timestamp + state updates.
   */
  const applyPlanUpdate = useCallback(
    (transform: (plan: StrategicPlan) => StrategicPlan): void => {
      if (!currentPlan) return;
      const updatedPlan = transform({
        ...currentPlan,
        updatedAt: new Date().toISOString(),
      });
      setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      setCurrentPlanState(updatedPlan);
    },
    [currentPlan]
  );

  // ── Plan management ────────────────────────────────────

  const setCurrentPlan = useCallback(
    (planId: string | null) => {
      if (planId) {
        const plan = plans.find((p) => p.id === planId);
        setCurrentPlanState(plan ?? null);
      } else {
        setCurrentPlanState(null);
      }
    },
    [plans]
  );

  const createPlan = useCallback((data: Partial<StrategicPlan> = {}): StrategicPlan => {
    const newPlan = createEmptyPlan(data);
    setPlans((prev) => [...prev, newPlan]);
    setCurrentPlanState(newPlan);
    return newPlan;
  }, []);

  const updatePlan = useCallback(
    (updates: Partial<StrategicPlan>) => {
      applyPlanUpdate((plan) => ({ ...plan, ...updates }));
    },
    [applyPlanUpdate]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      const prevPlans = [...plans];
      const prevCurrent = currentPlan;

      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (currentPlan?.id === planId) setCurrentPlanState(null);

      if (isAuthenticated && isOnline) {
        const result = await deletePlanOnServer(planId);
        if (!result.success && result.unauthorized) {
          // Roll back optimistic delete
          setPlans(prevPlans);
          setCurrentPlanState(prevCurrent);
        }
      }
    },
    [currentPlan, plans, isAuthenticated, isOnline, deletePlanOnServer]
  );

  // ── SWOT operations ────────────────────────────────────

  const addSWOTItem = useCallback(
    (item: Omit<SWOTItem, 'id'>) => {
      const newItem = { ...item, id: generateId() };
      applyPlanUpdate((plan) => ({
        ...plan,
        swotItems: [...plan.swotItems, newItem],
      }));
      broadcastChange('swot_change', { type: 'INSERT', data: newItem });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const updateSWOTItem = useCallback(
    (id: string, updates: Partial<SWOTItem>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        swotItems: plan.swotItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
      broadcastChange('swot_change', { type: 'UPDATE', data: { id, ...updates } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const removeSWOTItem = useCallback(
    (id: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        swotItems: plan.swotItems.filter((item) => item.id !== id),
      }));
      broadcastChange('swot_change', { type: 'DELETE', data: { id } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const bulkAddSWOTItems = useCallback(
    (items: Omit<SWOTItem, 'id'>[]) => {
      const newItems = items.map((item) => ({ ...item, id: generateId() }));
      applyPlanUpdate((plan) => ({
        ...plan,
        swotItems: [
          ...plan.swotItems,
          ...newItems,
        ],
      }));
      newItems.forEach((item) => broadcastChange('swot_change', { type: 'INSERT', data: item }));
    },
    [applyPlanUpdate, broadcastChange]
  );

  // ── Strategic options ──────────────────────────────────

  const addStrategicOption = useCallback(
    (option: Omit<StrategicOption, 'id'>) => {
      const newOption = { ...option, id: generateId() };
      applyPlanUpdate((plan) => ({
        ...plan,
        strategicOptions: [
          ...plan.strategicOptions,
          newOption,
        ],
      }));
      broadcastChange('strategic_option_change', { type: 'INSERT', data: newOption });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const updateStrategicOption = useCallback(
    (id: string, updates: Partial<StrategicOption>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        strategicOptions: plan.strategicOptions.map((opt) =>
          opt.id === id ? { ...opt, ...updates } : opt
        ),
      }));
      broadcastChange('strategic_option_change', { type: 'UPDATE', data: { id, ...updates } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const removeStrategicOption = useCallback(
    (id: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        strategicOptions: plan.strategicOptions.filter((opt) => opt.id !== id),
      }));
      broadcastChange('strategic_option_change', { type: 'DELETE', data: { id } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const bulkAddStrategicOptions = useCallback(
    (options: Omit<StrategicOption, 'id'>[]) => {
      const newOptions = options.map((opt) => ({ ...opt, id: generateId() }));
      applyPlanUpdate((plan) => ({
        ...plan,
        strategicOptions: [
          ...plan.strategicOptions,
          ...newOptions,
        ],
      }));
      newOptions.forEach((opt) => broadcastChange('strategic_option_change', { type: 'INSERT', data: opt }));
    },
    [applyPlanUpdate, broadcastChange]
  );

  // ── Objectives ─────────────────────────────────────────

  const addObjective = useCallback(
    (objective: Omit<BSCObjective, 'id' | 'kpis'>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: [
          ...plan.objectives,
          { ...objective, id: generateId(), kpis: [] },
        ],
      }));
    },
    [applyPlanUpdate]
  );

  const updateObjective = useCallback(
    (id: string, updates: Partial<BSCObjective>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj
        ),
      }));
    },
    [applyPlanUpdate]
  );

  const removeObjective = useCallback(
    (id: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.filter((obj) => obj.id !== id),
      }));
    },
    [applyPlanUpdate]
  );

  // ── KPIs ───────────────────────────────────────────────

  const addKPI = useCallback(
    (objectiveId: string, kpi: Omit<KPI, 'id' | 'objectiveId'>) => {
      const newKpi = { ...kpi, id: generateId(), objectiveId };
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.map((obj) =>
          obj.id === objectiveId
            ? { ...obj, kpis: [...obj.kpis, newKpi] }
            : obj
        ),
      }));
      broadcastChange('kpi_change', { type: 'INSERT', data: newKpi });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const updateKPI = useCallback(
    (objectiveId: string, kpiId: string, updates: Partial<KPI>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.map((obj) =>
          obj.id === objectiveId
            ? {
                ...obj,
                kpis: obj.kpis.map((kpi) =>
                  kpi.id === kpiId ? { ...kpi, ...updates } : kpi
                ),
              }
            : obj
        ),
      }));
      broadcastChange('kpi_change', { type: 'UPDATE', data: { id: kpiId, objectiveId, ...updates } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const removeKPI = useCallback(
    (objectiveId: string, kpiId: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        objectives: plan.objectives.map((obj) =>
          obj.id === objectiveId
            ? { ...obj, kpis: obj.kpis.filter((kpi) => kpi.id !== kpiId) }
            : obj
        ),
      }));
      broadcastChange('kpi_change', { type: 'DELETE', data: { id: kpiId, objectiveId } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  // ── PAPs ───────────────────────────────────────────────

  const addPAP = useCallback(
    (pap: Omit<PAP, 'id'>) => {
      const newPap = { ...pap, id: generateId() };
      applyPlanUpdate((plan) => ({
        ...plan,
        paps: [...plan.paps, newPap],
      }));
      broadcastChange('pap_change', { type: 'INSERT', data: newPap });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const updatePAP = useCallback(
    (id: string, updates: Partial<PAP>) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        paps: plan.paps.map((pap) => (pap.id === id ? { ...pap, ...updates } : pap)),
      }));
      broadcastChange('pap_change', { type: 'UPDATE', data: { id, ...updates } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  const removePAP = useCallback(
    (id: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        paps: plan.paps.filter((pap) => pap.id !== id),
      }));
      broadcastChange('pap_change', { type: 'DELETE', data: { id } });
    },
    [applyPlanUpdate, broadcastChange]
  );

  // ── Systems thinking ───────────────────────────────────

  /**
   * Replace the live CLD canvas (nodes + links) on the current plan.
   * Call this whenever the user finishes a drag, adds a node, or draws
   * a link so the canvas state is always persisted.
   */
  const updateCLD = useCallback(
    (nodes: CLDNode[], links: CLDLink[]) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        cldNodes: nodes,
        cldLinks: links,
      }));
    },
    [applyPlanUpdate]
  );

  /**
   * Capture the current canvas state as a named snapshot.
   *
   * @param label - Human-readable name for this snapshot
   * @returns The generated snapshot id (use to highlight it in the UI)
   */
  const saveCLDSnapshot = useCallback(
    (label: string): string | null => {
      if (!currentPlan) return null;

      const snapshotId = generateId();
      const snapshot: CLDSnapshot = {
        id: snapshotId,
        label: label.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
        nodes: currentPlan.cldNodes ?? [],
        links: currentPlan.cldLinks ?? [],
        createdAt: new Date().toISOString(),
      };

      applyPlanUpdate((plan) => ({
        ...plan,
        cldSnapshots: [...(plan.cldSnapshots ?? []), snapshot],
      }));

      return snapshotId;
    },
    [currentPlan, applyPlanUpdate]
  );

  /**
   * Restore the canvas to a previously saved snapshot.
   * The snapshot data itself is never mutated — load is non-destructive
   * to the snapshot list.
   *
   * @param snapshotId - id of the CLDSnapshot to restore
   */
  const loadCLDSnapshot = useCallback(
    (snapshotId: string) => {
      if (!currentPlan) return;

      const snapshot = (currentPlan.cldSnapshots ?? []).find((s) => s.id === snapshotId);
      if (!snapshot) return;

      applyPlanUpdate((plan) => ({
        ...plan,
        cldNodes: snapshot.nodes,
        cldLinks: snapshot.links,
        // Record which snapshot is currently displayed so the UI can highlight it
        activeCLDSnapshotId: snapshotId,
      }));
    },
    [currentPlan, applyPlanUpdate]
  );

  /**
   * Rename an existing snapshot in place.
   */
  const renameCLDSnapshot = useCallback(
    (snapshotId: string, newLabel: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        cldSnapshots: (plan.cldSnapshots ?? []).map((s) =>
          s.id === snapshotId ? { ...s, label: newLabel.trim() || s.label } : s
        ),
      }));
    },
    [applyPlanUpdate]
  );

  /**
   * Permanently remove a snapshot from the plan.
   * Clears activeCLDSnapshotId if it pointed at the deleted snapshot.
   */
  const deleteCLDSnapshot = useCallback(
    (snapshotId: string) => {
      applyPlanUpdate((plan) => ({
        ...plan,
        cldSnapshots: (plan.cldSnapshots ?? []).filter((s) => s.id !== snapshotId),
        activeCLDSnapshotId:
          plan.activeCLDSnapshotId === snapshotId ? undefined : plan.activeCLDSnapshotId,
      }));
    },
    [applyPlanUpdate]
  );

  /**
   * Toggle a systems archetype id on/off for the current plan.
   * Applied archetypes are persisted on `StrategicPlan.appliedArchetypes`
   * and survive plan switches, sync, and export.
   */
  const toggleArchetype = useCallback(
    (archetypeId: string) => {
      applyPlanUpdate((plan) => {
        const applied = plan.appliedArchetypes ?? [];
        const exists = applied.includes(archetypeId);
        return {
          ...plan,
          appliedArchetypes: exists
            ? applied.filter((id) => id !== archetypeId)
            : [...applied, archetypeId],
        };
      });
    },
    [applyPlanUpdate]
  );

  // ── Public API ─────────────────────────────────────────
  return {
    // State
    plans,
    currentPlan,
    activeView,
    isOnline,
    syncStatus,
    lastSynced,
    isLoading: isLoading || authLoading,
    conflicts,
    isAuthenticated: isAuthenticated && !authLoading,

    // Realtime collaboration
    presenceUsers,
    cursors,
    onlineUsers: useMemo(() => {
      return Object.values(presenceUsers)
        .flat()
        .filter((u, i, arr) => arr.findIndex((x) => x.user_id === u.user_id) === i);
    }, [presenceUsers]),
    updateCursor,

    // Navigation
    setActiveView,
    setLastSynced,

    // Plan management
    setCurrentPlan,
    createPlan,
    updatePlan,
    deletePlan,

    // SWOT
    addSWOTItem,
    updateSWOTItem,
    removeSWOTItem,
    bulkAddSWOTItems,

    // Strategy matrix
    addStrategicOption,
    updateStrategicOption,
    removeStrategicOption,
    bulkAddStrategicOptions,

    // Balanced Scorecard
    addObjective,
    updateObjective,
    removeObjective,
    addKPI,
    updateKPI,
    removeKPI,

    // Initiatives (PAP)
    addPAP,
    updatePAP,
    removePAP,

    // Systems thinking — CLD canvas
    updateCLD,
    saveCLDSnapshot,
    loadCLDSnapshot,
    renameCLDSnapshot,
    deleteCLDSnapshot,

    // Systems thinking — archetypes
    toggleArchetype,

    // Sync / conflict management
    resolveConflict,
    clearConflicts,
  };
};