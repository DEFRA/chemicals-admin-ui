const config = require('../config');

const getGlobalHeaders = request => ({
  'Content-Security-Policy': 'default-src \'self\';' +
      'style-src \'self\';' +
      'font-src \'self\' data:;' +
      'script-src \'self\' \'sha256-kTK4uXYVUDOoM2SZeaMUQVCEPANGHO+MpsKIdXoB3V0=\'',
  'Feature-Policy': 'geolocation \'none\'; ' +
      'camera \'none\'; ' +
      'microphone \'none\'; ',
  'Cache-Control': config.CACHE_CONTROL_POLICY,
});

const applyHeaders = (request) => {
  const { response } = request;
  const globalHeaders = getGlobalHeaders(request);
  const headers = Object.keys(globalHeaders);
  headers.forEach((header) => {
    if (response.isBoom) {
      response.output.headers[header] = globalHeaders[header];
    } else {
      response.header(header, globalHeaders[header]);
    }
  });
};

module.exports = {
  applyHeaders,
  getGlobalHeaders,
};
