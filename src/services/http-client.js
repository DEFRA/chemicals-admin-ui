const axios = require('axios');
const Boom = require('@hapi/boom');
const axiosRetry = require('axios-retry');
const logger = require('../logger');
const { generateHeaders } = require('./service-layer');

axiosRetry(axios, { retries: 3, shouldResetTimeout: true });

const determineError = (status, error, viewData) => {
  switch (status) {
    case 400:
      throw Boom.badRequest(error, { viewData });
    case 401:
    case 403:
    case 404:
      throw Boom.notFound(error, { viewData });
    default:
      throw error;
  }
};

/**
 * Weaves source IP and user token into the headers in the options
 */
const getHeaders = (req, options) => ({ ...options.headers, ...generateHeaders(req).headers });

const request = async (verb, req, options) => {
  try {
    logger.debug({ message: `Sending ${verb} to ${options.url}`, userId: req.userId });

    return await axios.request({
      ...options,
      method: verb,
      timeout: 300000,
      headers: getHeaders(req, options),
      ...options.config,
    });
  } catch (error) {
    return determineError(error.response.status, error, {});
  }
};

/**
 * GET from end point - weaving in necessary headers for the back end
 * @param req source request to inherit headers from
 * @param options contains `url`, `headers` etc
 * @returns {Promise<*|void>}
 */
const GET = async (req, options) => request('GET', req, options);

/**
 * POST to end point - weaving in necessary headers for the back end
 * @param req source request to inherit headers from
 * @param options contains `url`, `headers` etc
 * @returns {Promise<*|void>}
 */
const POST = async (req, options) => request('POST', req, options);

/**
 * PATCH to end point - weaving in necessary headers for the back end
 * @param req source request to inherit headers from
 * @param options contains `url`, `headers` etc
 * @returns {Promise<*|void>}
 */
const PATCH = async (req, options) => request('PATCH', req, options);

/**
 * PUT to end point - weaving in necessary headers for the back end
 * @param req
 * @param options
 * @returns {Promise<*|void|undefined>}
 * @constructor
 */
const PUT = async (req, options) => request('PUT', req, options);

/**
 * DELETE to end point - weaving in necessary headers for the back end
 * @param req
 * @param options
 * @returns {Promise<*|void>}
 * @constructor
 */
const DELETE = async (req, options) => request('DELETE', req, options);

module.exports = {
  GET,
  POST,
  PATCH,
  PUT,
  DELETE,
};
