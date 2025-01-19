// Simple console logger for now
// TODO: Replace with a proper logging solution like winston or pino

export const logger = {
    debug: (data: any, message?: string) => {
        console.log('[DEBUG]', message || '', data);
    },
    info: (data: any, message?: string) => {
        console.log('[INFO]', message || '', data);
    },
    warn: (data: any, message?: string) => {
        console.warn('[WARN]', message || '', data);
    },
    error: (data: any, message?: string) => {
        console.error('[ERROR]', message || '', data);
    }
};
