require('../../helpers/viewHelpers');
const messages = require('../../messages.json');
const featureToggleService = require('../../services/feature-toggle-service');
const configurableContentService = require('../../services/configurable-content-service');

const handlers = () => {
  const GET = async (request, h) => {
    const featureToggles = await featureToggleService.getFeatureToggles(request);
    const scheduledBanners = await configurableContentService.getLatestContents(request, 'BANNER');

    const data = {
      title: messages.homepage.title,
      labels: messages.homepage.labels,
      featureToggles,
      scheduledBanners,
    };

    return h.view('homepage', data);
  };

  return {
    GET,
  };
};

module.exports = {
  handlers,
};
