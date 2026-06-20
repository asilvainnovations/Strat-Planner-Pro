import React from 'react';
import { cn } from '@/lib/utils';

const STRAT_LOGO_URL =
  'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/pending-tasks/public/Strat%20Planner%20Pro%20logo.png';

const AI_STRATEGIST_LOGO_URL =
  'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/pending-tasks/public/ASilva%20Innovations%20Logo.png';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
  alt?: string;
}

const sizeMap: Record<NonNullable<LogoProps['size']>, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

/** Circular brand logo for Strat Planner Pro */
export const StratLogo: React.FC<LogoProps> = ({
  size = 'md',
  className,
  withGlow = false,
  alt = 'Strat Planner Pro',
}) => (
  <div
    className={cn(
      'relative rounded-full overflow-hidden ring-2 ring-cyan-400/40 bg-slate-900 flex-shrink-0 shadow-lg',
      withGlow && 'shadow-cyan-500/40',
      sizeMap[size],
      className
    )}
  >
    <img
      src={STRAT_LOGO_URL}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  </div>
);

/** Circular AI Strategist avatar (ASilva Innovations) */
export const AIStrategistAvatar: React.FC<LogoProps> = ({
  size = 'md',
  className,
  withGlow = true,
  alt = 'AI Strategist',
}) => (
  <div
    className={cn(
      'relative rounded-full overflow-hidden ring-2 ring-fuchsia-400/50 bg-slate-900 flex-shrink-0 shadow-lg',
      withGlow && 'shadow-fuchsia-500/40 animate-pulse-slow',
      sizeMap[size],
      className
    )}
  >
    <img
      src={AI_STRATEGIST_LOGO_URL}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  </div>
);

export default StratLogo;
