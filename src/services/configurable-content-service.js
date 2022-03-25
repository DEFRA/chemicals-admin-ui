const config = require('../config.js');
const httpClient = require('../services/http-client');

const updateConfigurableContent = async (request, configurableContent) =>
  httpClient.POST(request, {
    url: `${config.REACH_API}/configurable-contents`,
    data: configurableContent,
  });

const addConfigurableContent = async (request, configurableContent) =>
  httpClient.POST(request, {
    url: `${config.REACH_API}/configurable-contents`,
    data: configurableContent,
  });

const getActiveConfigurableContent = async (request, contentType) => {
  const response = await httpClient.GET(request, {
    url: `${config.REACH_API}/configurable-contents/${contentType}/active`,
  });

  return response.data;
};

const getLatestContents = async (request, contentType) => {
  const response = await httpClient.GET(request, {
    url: `${config.REACH_API}/configurable-contents/types/${contentType}`,
  });

  return response.data;
};

const getContent = async (request, configurableContentId) => {
  const response = await httpClient.GET(request, {
    url: `${config.REACH_API}/configurable-contents/${configurableContentId}`,
  });

  return response.data;
};

const deleteContent = async (request, configurableContentId) =>
  httpClient.DELETE(request, {
    url: `${config.REACH_API}/configurable-contents/${configurableContentId}`,
  });

module.exports = {
  addConfigurableContent,
  updateConfigurableContent,
  getActiveConfigurableContent,
  getLatestContents,
  getContent,
  deleteContent,
};
