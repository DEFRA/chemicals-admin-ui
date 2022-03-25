const config = require('./config');
const operationUtil = require('./utils/operationUtil');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf } = format;

const logFormat = printf(({
  level, timestamp: ts, userId, message,
}) => {
  const formattedLevel = level.toUpperCase().padEnd(5, ' ');
  const operationId = operationUtil.getOperationId() || '--';
  return `${formattedLevel} [${ts}] [user: ${userId}] [oid: ${operationId}] - ${message}`;
});

const logger = createLogger({
  level: config.reachSupportAdminLoggingFeLevel,
  format: combine(
    timestamp(),
    format.splat(), // Allows for %s to be used in log statements
    logFormat,
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
