import pino from 'pino';

const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid',
    },
});

export const log = {
    info: (message: string, details?: string) =>
        logger['info'](message, details),
    warn: (message: string, details?: string) =>
        logger['warn'](message, details),
    error: (message: string, details?: string) =>
        logger['error'](message, details),
    fatal: (message: string, details?: string) =>
        logger['fatal'](message, details),
    trace: (message: string, details?: string) =>
        logger['trace'](message, details),
};
