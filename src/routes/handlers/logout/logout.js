const sessionService = require('../../../services/session-service');

const handlers = () => {
  const LOGOUT = async (request, h) => {
    request.cookieAuth.clear();
    sessionService.revoke(request, false);
    h.unstate('crumb');

    return h.redirect('/logged-out');
  };

  return {
    LOGOUT,
  };
};

module.exports = {
  handlers,
};
