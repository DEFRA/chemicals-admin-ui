const messages = require('../messages.json');

const constructDefaultViewData = (request) => {
  // If there is a userAccount in the request, we define the user as logged in
  const isLoggedIn = !!(request.userAccount);
  const { isAuthenticated } = request.auth;

  return {
    general: messages.general.labels,
    isLoggedIn,
    isAuthenticated,
    userAccount: request.userAccount,
  };
};

module.exports = {
  constructDefaultViewData,
};
