const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const bell = require('@hapi/bell');
const crumb = require('@hapi/crumb');
const yar = require('@hapi/yar');
const catboxRedis = require('@hapi/catbox-redis');
const catboxMemory = require('@hapi/catbox-memory');

const loggerPlugin = require('../plugin/logger/commonLogger');

const DependantHealthCheckService = require('../services/dependant-health-check-service');
const pjson = require('pjson');

const config = require('../config');
const routes = require('../routes/routes');
const views = require('../views');
const auth = require('../auth');
const redisClient = require('../cache-service/redisClient');

const logger = require('../logger');
const crumbValidator = require('../utils/crumbTokenValidator');
const { preResponseHandler } = require('./preResponseHandler');

const getCacheConfig = () => {
  const partition = config.redisPrefix ? config.redisPrefix : 'localhost';
  if (config.environment === 'test') {
    return {
      provider: {
        constructor: catboxMemory,
        options: {
          partition,
        },
      },
    };
  }

  const hostPort = {
    host: config.redisServerName,
    port: config.redisServerPort,
  };

  if (config.environment === 'dev') {
    return {
      provider: {
        constructor: catboxRedis,
        options: {
          ...hostPort,
          partition,
        },
      },
    };
  }

  return {
    provider: {
      constructor: catboxRedis,
      options: {
        ...hostPort,
        password: config.redisServerKey,
        tls: {
          servername: config.redisServerName,
        },
        partition,
      },
    },
  };
};

const createServer = (port) => {
  const server = Hapi.server({
    host: '0.0.0.0',
    port,
    routes: {
      security: {
        hsts: {
          // max age of strict transport security header
          maxAge: 31536000,
          includeSubDomains: true,
        },
        xframe: 'deny',
        xss: true,
        noSniff: true,
        referrer: 'strict-origin-when-cross-origin',
      },
    },
    router: {
      isCaseSensitive: false,
    },
    cache: [
      {
        ...getCacheConfig(),
      },
    ],
  });

  function parseCookies(request) {
    const list = {};
    const rc = request.headers.cookie;
    if (!rc) {
      return list;
    }

    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
  }

  server.ext('onRequest', (request, response) => {
    if (request.path.includes('public')) {
      return response.continue;
    }
    const cookieCrumb = parseCookies(request).crumb;
    const result = crumbValidator.validate(cookieCrumb);
    if (!result) {
      return response.continue;
    }
    if (result.error) {
      logger.error('Crumb value has been manually modified');
      throw new Error('Invalid crumb token');
    }

    return response.continue;
  });

  server.ext('onPreResponse', preResponseHandler);

  return server;
};

const buildHealthCheckRegistry = (server) => {
  server.healthchecks = [
    redisClient,
    new DependantHealthCheckService(),
  ];
};

const configureServer = async (server, crumbOptions) => {
  server.app.version = pjson.version;
  await server.register(bell);
  await server.register(Inert);
  await server.register(Vision);

  await server.register({ plugin: loggerPlugin });

  await server.register({
    plugin: crumb,
    options: crumbOptions,
  });

  await server.register({
    plugin: yar,
    options: {
      storeBlank: false,
      maxCookieSize: process.env.NODE_ENV === 'test' ? 120000 : 0, // Setting size zero forces yar to default to server side caching
      cache: { segment: 'session', expiresIn: config.redisCacheTimeout },
      cookieOptions: {
        password: config.reachSupportAdminCookieSecret,
        isSecure: config.environment === 'production',
        ttl: config.cookieExpiryTime,
        isHttpOnly: true,
        isSameSite: 'Strict',
      },
    },
  });

  await auth.configureServerAuthMethod(server);

  server.views(views);
  server.route(routes);

  if (process.env.NODE_ENV !== 'test') {
    buildHealthCheckRegistry(server);
  }
};

module.exports = {
  createServer,
  configureServer,
};
