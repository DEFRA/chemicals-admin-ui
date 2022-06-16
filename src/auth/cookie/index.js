const config = require('../../config');
const sessionService = require('../../services/session-service');

/**
 * cookie auth configuration details used for all secured routes.
 * @type {function(*): {password: *, cookie: (*|string), redirectTo: *,
 * redirectOnTry: boolean, appendNext: boolean, isSecure: boolean, ttl: null,
 * isHttpOnly: boolean, isSameSite: string, domain: null,
 * validateFunc: (function(*=, *): {valid: boolean})}}
 */
const cookieAuthConfig = redirectTo => ({
  cookie: {
    name: config.cookieName,
    password: config.reachSupportAdminCookieSecret,
    isSecure: config.environment === 'production',
    ttl: config.cookieExpiryTime,
    isSameSite: 'Strict',
    isHttpOnly: true,
    domain: null,
  },
  redirectTo,
  appendNext: true,
  validateFunc: async (request, session) => {
    const userDetails = sessionService.get('userDetails', request);
    const claims = sessionService.get('claims', request);

    const equalSIDs = sessionService.getSessionId(request) === session.sessionId;
    const out = {
      valid: !!userDetails && !!claims && equalSIDs,
    };

    if (out.valid) {
      out.credentials = {
        userAccount: userDetails,
        claims,
      };

      request.userAccount = userDetails;
      request.claims = claims;
      request.userId = userDetails.userId;
    }

    return out;
  },
});

exports.registerCookieStrategy = (server) => {
  const redirectTo = '/auth';
  server.auth.strategy('session', 'cookie', cookieAuthConfig(redirectTo));
  server.auth.default('session');
};
