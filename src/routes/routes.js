const featureToggle = require('./handlers/settings/feature-toggle');
const banner = require('./handlers/customisation/banner');
const Boom = require('@hapi/boom');

const homepage = require('./handlers/homepage');
const root = require('./handlers/root');

const healthcheck = require('./handlers/health-check');
const { routeAuthConfig, publicRouteAuthConfig } = require('../auth');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: root.handlers().GET,
    options: {
      ...publicRouteAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/homepage',
    handler: homepage.handlers().GET,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/feature-toggle/{featureToggleId}',
    handler: featureToggle.handlers().GET,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'POST',
    path: '/feature-toggle/{featureToggleId}',
    handler: featureToggle.handlers().POST,
    options: {
      ...routeAuthConfig,
      payload: {
        multipart: true,
      },
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/banner/live',
    handler: banner.handlers().LIVE_GET,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/banner/{configurableContentId}',
    handler: banner.handlers().SCHEDULED,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/banner/create',
    handler: banner.handlers().CREATE_GET,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'POST',
    path: '/banner/create',
    handler: banner.handlers().CREATE_POST,
    options: {
      ...routeAuthConfig,
      payload: {
        multipart: true,
      },
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'POST',
    path: '/banner/{configurableContentId}/delete',
    handler: banner.handlers().DELETE,
    options: {
      ...routeAuthConfig,
      payload: {
        multipart: true,
      },
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'POST',
    path: '/banner/live',
    handler: banner.handlers().LIVE_POST,
    options: {
      ...routeAuthConfig,
      payload: {
        multipart: true,
      },
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: 'public/',
        listing: false,
      },
    },
    options: {
      auth: false, // No auth required for serving assets
      plugins: {
        loggerPlugin: false,
      },
    },
  },
  {
    method: 'GET',
    path: '/healthcheck',
    handler: healthcheck.handlers().GET,
    options: {
      auth: false, // No auth required for healthcheck endpoint
      plugins: {
        crumb: {},
        loggerPlugin: false,
      },
    },
  },
  {
    method: 'GET',
    path: '/{any*}',
    handler: (request, h) => {
      throw Boom.notFound('Page does not exist');
    },
    options: {
      plugins: {
        crumb: {},
      },
      ...publicRouteAuthConfig,
    },
  },
];
