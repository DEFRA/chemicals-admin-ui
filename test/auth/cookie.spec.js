const sinon = require('sinon');
const chai = require('chai');
const cookie = require('../../src/auth/cookie');
const sessionService = require('../../src/services/session-service');
const config = require('../../src/config');
chai.use(require('sinon-chai'));

const { expect } = chai;

describe('cookie auth tests', () => {
  let sandbox;
  let server;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(sessionService, 'get');
    sandbox.stub(sessionService, 'getSessionId');
    server = {
      auth: {
        default: sandbox.stub(),
        strategy: sandbox.stub(),
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should register cookie session strategy', () => {
    cookie.registerCookieStrategy(server);

    expect(server.auth.default).to.have.been.calledWith('session');
    expect(server.auth.strategy).to.have.been.calledWithMatch('session', 'cookie', {
      appendNext: true,
      cookie: {
        domain: null,
        isHttpOnly: true,
        isSameSite: 'Strict',
        isSecure: false,
        name: 'reach-support-admin',
        password: config.reachSupportAdminCookieSecret,
        ttl: '86400000',
      },
      redirectTo: '/auth',
      validateFunc: sinon.match.func,
    });
  });

  it('session is invalid for different session id', async () => {
    cookie.registerCookieStrategy(server);

    const validateFunction = server.auth.strategy.firstCall.args[2].validateFunc;

    const userDetails = {};
    const claims = {};
    sessionService.get.withArgs('userDetails').returns(userDetails);
    sessionService.get.withArgs('claims').returns(claims);
    sessionService.getSessionId.returns('session1');

    const request = {};
    const session = {
      sessionId: 'session2',
    };

    const output = await validateFunction(request, session);

    expect(output).to.eql({
      valid: false,
    });
  });

  it('session is invalid for no user details ', async () => {
    cookie.registerCookieStrategy(server);

    const validateFunction = server.auth.strategy.firstCall.args[2].validateFunc;

    sessionService.get.withArgs('userDetails').returns(null);
    sessionService.get.withArgs('claims').returns({});
    sessionService.getSessionId.returns('session1');

    const request = {};
    const session = {
      sessionId: 'session1',
    };

    const output = await validateFunction(request, session);

    expect(output).to.eql({
      valid: false,
    });
  });

  it('session is invalid for no claims', async () => {
    cookie.registerCookieStrategy(server);

    const validateFunction = server.auth.strategy.firstCall.args[2].validateFunc;

    sessionService.get.withArgs('userDetails').returns({});
    sessionService.get.withArgs('claims').returns(null);
    sessionService.getSessionId.returns('session1');

    const request = {};
    const session = {
      sessionId: 'session1',
    };

    const output = await validateFunction(request, session);

    expect(output).to.eql({
      valid: false,
    });
  });

  it('validate a valid session ', async () => {
    cookie.registerCookieStrategy(server);

    const validateFunction = server.auth.strategy.firstCall.args[2].validateFunc;

    const userDetails = {
      id: 'dummy user',
    };
    const claims = {
      id: 'dummy creds',
    };
    sessionService.get.withArgs('userDetails').returns(userDetails);
    sessionService.get.withArgs('claims').returns(claims);
    sessionService.getSessionId.returns('session1');

    const request = {};
    const session = {
      sessionId: 'session1',
    };

    const output = await validateFunction(request, session);

    expect(output).to.eql({
      valid: true,
      credentials: {
        claims,
        userAccount: userDetails,
      },
    });
  });
});
