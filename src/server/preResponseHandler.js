const { constructDefaultViewData } = require('../helpers/dataHelper');
const { handleBoomError } = require('../error-handling/error-handler');
const { applyHeaders } = require('./globalHeaders');

const preResponseHandler = (request, reply) => {
  // First ignore all assets and health check
  if (request.path.includes('public/') || request.path.includes('healthcheck')) {
    return reply.continue;
  }

  // Add global headers to every response
  applyHeaders(request);

  // Create context and handle errors
  if (!request.response.isBoom) {
    const defaultViewData = constructDefaultViewData(request);
    const context = request.response.source.context || {};
    request.response.source.context = {
      ...defaultViewData,
      ...context,
    };
  } else {
    return handleBoomError(request, reply);
  }

  return reply.continue;
};

module.exports = {
  preResponseHandler,
};
