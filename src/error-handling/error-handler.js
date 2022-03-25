const labels = require('../messages');
const logger = require('../logger');
const { constructDefaultViewData } = require('../helpers/dataHelper');
const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require('http-status');
const { getGlobalHeaders } = require('../server/globalHeaders');
const errorReference = require('../utils/errorReference');

const createResponseWithHeaders = (request, reply, template, viewData, code) => {
  const result = reply.view(template, viewData).code(code);
  Object.entries(getGlobalHeaders(request)).forEach(([key, value]) => {
    result.header(key, value);
  });
  return result;
};
/**
 * @param {*} request
 * @param {*} reply
 * @returns
 */
const handleBoomServerError = (request, reply) => {
  const { systemErrorView, serviceHelpline } = labels;
  const defaultViewData = constructDefaultViewData(request);
  const viewData = {
    title: systemErrorView.labels.pageTitle,
    'error-phrase': errorReference.getErrorReference(),
    ...defaultViewData,
    labels: {
      ...systemErrorView.labels,
      ...serviceHelpline.labels,
    },
  };

  return createResponseWithHeaders(request, reply, '5XX', viewData, INTERNAL_SERVER_ERROR);
};

/**
 * @param {*} request
 * @param {*} reply
 * @returns {*}
 */
const getResponseForBoomError = (request, reply) => {
  const { pageNotFoundView, serviceHelpline } = labels;
  const defaultViewData = constructDefaultViewData(request);
  const viewData = {
    title: pageNotFoundView.labels.pageTitle,
    ...defaultViewData,
    labels: {
      ...pageNotFoundView.labels,
      ...serviceHelpline.labels,
    },
  };

  return createResponseWithHeaders(request, reply, '404', viewData, NOT_FOUND);
};

/**
 * Returns the error message returned by the REACH service if error has
 * been bubbled up from the http-client.
 * Otherwise it will return the default stacktrace
 * @param response Hapi response object
 */
function getErrorMessage(response) {
  if (response.response && response.response.data) {
    const { request } = response;
    return `Call ${request.method} ${request.path} encountered an error: '${response.response.data.message}'`;
  }
  return response.stack;
}

/**
 * @param {*} request
 * @param {*} reply
 * @returns
 */
const handleBoomError = (request, reply) => {
  const { response } = request;
  logger.error({
    message: getErrorMessage(response),
    userId: request.userId,
  });

  if (response.isServer) {
    // handle 5XX errors differently
    return handleBoomServerError(request, reply);
  }
  return getResponseForBoomError(request, reply);
};


module.exports = {
  handleBoomError,
};
