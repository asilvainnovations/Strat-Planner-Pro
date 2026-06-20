type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

const formatMessage = (level: LogLevel, message: string, context?: Record<string, unknown>): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, context));
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('info')) console.info(formatMessage('info', message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, context));
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context), error);
    }
  },
};
