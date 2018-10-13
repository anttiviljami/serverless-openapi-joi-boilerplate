import { basename } from 'path';
import { createLogger as winston, format, transports } from 'winston';
const { combine, timestamp, label, prettyPrint } = format;

export function createLogger(filePath: string) {
  const logger = winston({
    transports: [new transports.Console({
      format: combine(
        label({ label: basename(filePath) }),
        timestamp(),
        prettyPrint(),
      ),
    })],
  });
  return logger;
}
