const assert = require('assert');
const hapiAuthCookie = require('@hapi/cookie');

const cookie = require('./cookie');
const config = require('../config');
const authRoutes = require('./routes/authRoutes');

const environmentCheck = () => {
  assert(config.aadClientID, 'Missing AAD Client ID');
  assert(config.aadClientSecret, 'Missing AAD Client Secret');
  assert(config.aadCookiePassword, 'Missing AAD Cookie Password');
  assert(config.aadTenantID, 'Missing AAD Tenant ID');
};

const registerRoutes = (server) => {
  server.route(authRoutes);
};

const configureServerAuthMethod = async (server) => {
  environmentCheck();

  await server.register(hapiAuthCookie);

  server.auth.strategy('azuread', 'bell', {
    provider: 'azure-legacy',
    password: config.aadCookiePassword,
    clientId: config.aadClientID,
    clientSecret: config.aadClientSecret,
    config: {
      tenantId: config.aadTenantID,
      tenant: config.aadTenantID,
    },
    isSecure: config.environment === 'production',
    forceHttps: config.environment === 'production',
    location: config.environment === 'production' ? config.aadRedirectURI : 'http://localhost:8001',
  });

  cookie.registerCookieStrategy(server);

  registerRoutes(server);
};

const routeAuthConfig = { auth: { mode: 'required' } };
const publicRouteAuthConfig = { auth: { mode: 'try' } };

module.exports = {
  configureServerAuthMethod,
  routeAuthConfig,
  publicRouteAuthConfig,
};
