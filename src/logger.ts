import pino = require('pino');
import { Stream } from 'stream';

import config from './config';

const logThrough = new Stream.PassThrough();
export const log = pino({
  name: config.logger.name,
  level: config.logger.level,
});

logThrough.pipe(process.stdout);
