const { expect } = require('chai');
const { configureServer } = require('../../src/server/server');
const pjson = require('pjson');

describe('Configure Server Tests', () => {
  it('Configure Server', async () => {
    const server = {
      app: () => {},
      auth: {
        strategy: () => {},
        default: () => {},
      },
      register: () => {},
      cache: () => {},
      ext: () => {},
      route: () => {},
      views: () => {},
      method: () => {},
    };

    await configureServer(server);
    expect(server.app.version).to.equal(pjson.version);
  });
});
