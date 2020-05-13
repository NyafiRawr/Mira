import pino = require('pino');
import { Stream } from 'stream';

import config from './config';

const logThrough = new Stream.PassThrough();
export const log = pino({
  name: config.logger.name,
  level: config.logger.level
});

log.info.bind(log);
log.warn.bind(log);
log.error.bind(log);
log.debug.bind(log);

logThrough.pipe(process.stdout);
