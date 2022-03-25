const routeAuthConfig = require('../../auth');
const login = require('../../routes/handlers/login/login');
const logout = require('../../routes/handlers/logout/logout');
const loggedOut = require('../../routes/handlers/logout/loggedOut');

const publicRouteAuthConfig = { auth: { mode: 'try' } };

module.exports = [
  {
    method: ['GET', 'POST'],
    path: '/auth',
    handler: login.handlers().LOGIN,
    options: {
      auth: {
        strategy: 'azuread',
      },
    },
  },
  {
    method: 'GET',
    path: '/logout',
    handler: logout.handlers().LOGOUT,
    options: {
      ...routeAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
  {
    method: 'GET',
    path: '/logged-out',
    handler: loggedOut.handlers().GET,
    options: {
      ...publicRouteAuthConfig,
      plugins: {
        crumb: {},
      },
    },
  },
];
