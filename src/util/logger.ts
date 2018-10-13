import { basename } from 'path';
import { createLogger as winston, format, transports } from 'winston';
const { combine, label, timestamp, colorize, printf } = format;

const logFormat = printf((info) =>
  `${info.timestamp} [${info.label}] ${info.level}: ${info.message} ${info[Symbol.for('splat') as any]}`);

export function createLogger(filePath: string) {
  const logger = winston({
    transports: [new transports.Console()],
    format: combine(
      label({ label: basename(filePath) }),
      timestamp(),
      colorize(),
//      prettyPrint(),
      logFormat,
    ),
  });
  return logger;
}
