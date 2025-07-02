import pino from 'pino';
import { Logger } from '../types';

const instance = pino({ level: 'debug' });

export const logger: Logger = {
    debug: instance.debug.bind(instance),
    info: instance.info.bind(instance),
    warn: instance.warn.bind(instance),
    error: instance.error.bind(instance),
    fatal: instance.fatal.bind(instance)
};
