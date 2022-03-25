const _ = require('lodash');
const jwt = require('../jwt/token');

const X_FORWARDED_FOR = 'x-forwarded-for';

/**
 * Attempts to return the content of the forwarded for header, if unsuccessful will
 * return IP address or empty string.
 *
 * Note: the abstract comparison of xFFHeader here is intentional to capture both
 * null and undefined edge cases
 *
 * @param request - the headers as part of the server request object
 * @returns {string} - x forwarded for header, IP or empty string.
 */
const getNetworkOrigin = (request) => {
  if (!request.headers && !request.info) {
    return '';
  }
  const xFFHeader = request.headers[X_FORWARDED_FOR];

  if (xFFHeader == null) {
    return request.info.remoteAddress;
  }
  return xFFHeader;
};

/**
 * Extract the headers needed for the back end from the user request
 * @param request
 * @returns {{headers: {Authorization, "x-forwarded-for": string}}}
 */
const generateHeaders = (request) => {
  const token = jwt.createToken(request.claims);
  const authHeader = token ? jwt.getAuthHeader(token) : undefined;
  const forwardedFor = getNetworkOrigin(request);

  return {
    headers: _.omitBy({
      'x-forwarded-for': forwardedFor,
      ...authHeader,
      'x-remote-user': request.claims.userId,
    }, _.isEmpty),
  };
};

module.exports = {
  generateHeaders,
  getNetworkOrigin,
};
