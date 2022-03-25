const { expect } = require('chai');
const { configureServer, createServer } = require('../src/server/server');
const FormData = require('form-data');
const _ = require('lodash');
const streamToPromise = require('stream-to-promise');

const decorateResponse = (response) => {
  response.assertStatusCode = (expected) => {
    expect(response.statusCode).to.equal(expected);
  };
  response.assertLocation = (expected) => {
    expect(response.headers.location).to.equal(expected);
  };

  return response;
};

const decorateServer = (server) => {
  // temporary, should extend the hapi server and build this in
  server.originalInject = server.inject;
  server.inject = async (options, bypassAuth = true) => {
    let newOptions;
    if (bypassAuth) {
      if (options.constructor === Object) {
        newOptions = { ...options };
        newOptions.auth = {
          credentials: {},
          strategy: 'simple',
        };
      } else {
        newOptions = {
          url: options, // will be a string for the url
          auth: {
            credentials: {},
            strategy: 'simple',
          },
        };
      }
    }

    return server.originalInject(newOptions);
  };

  server.injectAssertResponseStatusCode = async (options, statusCode) => {
    const response = await server.inject(options);
    expect(response.statusCode).to.equal(statusCode);
    return response;
  };

  server.injectWithFormDataPayload = async (options, payload, expectedStatusCode) => {
    const formData = new FormData(payload);
    _.forIn(payload, (value, key) => formData.append(key, value));
    options.payload = await streamToPromise(formData);
    options.auth = {
      credentials: {},
      strategy: 'simple',
    }; // bypasses auth strategies
    options.headers = formData.getHeaders();

    const response = await server.inject(options);
    decorateResponse(response);
    if (expectedStatusCode) {
      response.assertStatusCode(expectedStatusCode);
    }
    return response;
  };
};

const init = async () => {
  const server = createServer(process.env.PORT || 8001);
  await configureServer(server, { skip: () => true }, {});
  decorateServer(server);
  return server;
};

module.exports = {
  init,
};
