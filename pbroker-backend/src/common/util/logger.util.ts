import { createLogger } from 'winston';
import { LoggerConfig } from '../config/logger.config.js';
export const logger = createLogger(LoggerConfig);