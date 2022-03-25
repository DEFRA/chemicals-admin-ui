const logger = require('../../logger');

const internals = {};

internals.isValidRoute = request => request.route.settings.plugins.loggerPlugin !== false;

module.exports.register = function register(server) {
  server.ext('onPostAuth', (request, h) => {
    if (internals.isValidRoute(request)) {
      logger.info({
        message: `${request.method.toUpperCase()} ${request.route.path}`,
        userId: request.userId,
      });
    }
    return h.continue;
  });
};

module.exports.pkg = {
  name: 'loggerPlugin',
  version: '1.0.0',
};
