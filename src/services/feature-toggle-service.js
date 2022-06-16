const config = require('../config.js');
const httpClient = require('../services/http-client');

/**
 * Get the full list of feature toggles
 * @param request
 * @returns {Promise<*>}
 */

const getFeatureToggles = async (request) => {
  const response = await httpClient.GET(request, {
    url: `${config.REACH_API}/feature-toggle`,
  });

  return response.data;
};

/**
 * Gets the data for a specified feature toggle
 * @param request
 * @param featureToggleId the UUID of the particular feature toggle
 * @returns {Promise<*>}
 */

const getFeatureToggle = async (request, featureToggleId) => {
  const response = await httpClient.GET(request, {
    url: `${config.REACH_API}/feature-toggle/${featureToggleId}`,
  });

  return response.data;
};

/**
 * Updates a specified feature toggle
 * @param request
 * @param featureToggleId the UUID of the particular feature toggle
 * @param featureToggle the updated feature toggle
 * @returns {Promise<void>}
 */

const updateFeatureToggle = async (request, featureToggleId, featureToggle) => {
  await httpClient.PUT(request, {
    url: `${config.REACH_API}/feature-toggle/${featureToggleId}`,
    data: featureToggle,
  });
};


module.exports = {
  getFeatureToggles,
  getFeatureToggle,
  updateFeatureToggle,
};
