import * as util from 'util';
import { identity } from 'lodash';
import { basename } from 'path';
import { createLogger as winston, format, transports } from 'winston';
const { combine, label, timestamp, colorize, printf } = format;

const inspect = (subject: any): string => typeof subject === 'string' ? subject : util.inspect(subject);
const meta = Symbol.for('splat') as any;
const logFormat = printf((info) =>
  `${info.timestamp} [${info.label}] ${info.level}: ${[
    info.message,
    ...info[meta] || [],
  ].filter(identity).map(inspect).join(', ')}`);

export function createLogger(filePath: string) {
  const logger = winston({
    transports: [new transports.Console()],
    format: combine(
      label({ label: basename(filePath) }),
      timestamp(),
      colorize(),
      logFormat,
    ),
  });
  return logger;
}
