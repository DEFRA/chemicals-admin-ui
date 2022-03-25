const { CorrelationContextManager } = require('applicationinsights/out/AutoCollection/CorrelationContextManager');

/**
 * Returns the operation-id for the current request.
 *
 * @returns {string}
 */
const getOperationId = () => CorrelationContextManager.getCurrentContext()?.operation?.id;

module.exports = {
  getOperationId,
};
