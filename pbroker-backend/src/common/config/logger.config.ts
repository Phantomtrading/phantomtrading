import { format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = resolve(__dirname, '../../../logs');

export const LoggerConfig = {
  level: isProduction ? 'info' : 'debug',

  format: isProduction
    ? format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      )
    : format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack }) => {
          return `[${timestamp}] ${level}: ${stack || message}`;
        })
      ),

  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
    new transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      handleExceptions: true,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
    }),
    new transports.File({
      filename: `${logDir}/combined.log`,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],

  exceptionHandlers: [
    new transports.File({ filename: `${logDir}/exceptions.log` }),
  ],

  rejectionHandlers: [
    new transports.File({ filename: `${logDir}/rejections.log` }),
  ],

  exitOnError: false,
};
