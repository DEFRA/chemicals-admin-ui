const messages = require('../../../messages');

const handlers = () => {
  const GET = async (request, h) =>
    h.view('user/loggedOut', {
      general: messages.general.labels,
      title: messages.logoutView.labels.pageTitle,
      labels: messages.logoutView.labels,
    });

  return {
    GET,
  };
};

module.exports = {
  handlers,
};
