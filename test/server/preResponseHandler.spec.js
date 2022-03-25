const preResponseHandler = require('../../src/server/preResponseHandler');
const messages = require('../../src/messages.json');

const sinon = require('sinon');

const { expect } = require('chai');

describe('preResponseHandler tests', () => {
  let sandbox;
  let fakeRequest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fakeRequest = {
      app: {},
      userAccount: {
        id: '123',
      },
      response: {
        source: {
          context: {},
        },
        output: {
          headers: {},
        },
      },
      path: '/fake-path',
      state: {},
      auth: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  const fakeReply = {
    continue: true,
  };

  it('should check that constructDefaultViewData are called as part of the preResponseHandler', () => {
    // This fakes the Hapi response.header function, as we're not testing this here
    fakeRequest.response.header = function header() {};

    const response = preResponseHandler.preResponseHandler(fakeRequest, fakeReply);
    expect(fakeRequest.response.source.context.general.header.serviceName).to.be.equal(messages.general.labels.header.serviceName);
    expect(fakeRequest.response.source.context.userAccount).to.be.equal(fakeRequest.userAccount);
    expect(response).to.be.true;
  });

  it('should check that preResponseHandler continues immediately for public paths', () => {
    // This fakes the Hapi response.header function, as we're not testing this here
    fakeRequest.response.header = function header() {};
    fakeRequest.path = 'public/';

    const response = preResponseHandler.preResponseHandler(fakeRequest, fakeReply);
    expect(fakeRequest.response.source.context.general).to.be.undefined;
    expect(fakeRequest.response.source.context.userAccount).to.be.undefined;
    expect(response).to.be.true;
  });
});
