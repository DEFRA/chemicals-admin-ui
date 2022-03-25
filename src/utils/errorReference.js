const logger = require('../logger');
const HexToWords = require('guid-in-words');
const operationUtil = require('./operationUtil');

/**
 * Returns a 4 word phrase to be shown to the user which can be used to identify the operation which failed.
 *
 * @returns {string}
 */
const getErrorReference = () => {
  const operationId = operationUtil.getOperationId();
  const errorReference = HexToWords.toWords(operationId.substring(0, 8)).replace(/\s/g, '-');
  logger.info({ message: `Generated error reference '${errorReference}' for operation id ${operationId}` });
  return errorReference;
};

module.exports = {
  getErrorReference,
};
