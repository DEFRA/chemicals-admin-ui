const logoutHandler = require('../../../../src/routes/handlers/logout/logout');
const loggedOutHandler = require('../../../../src/routes/handlers/logout/loggedOut');
const sessionService = require('../../../../src/services/session-service');
const sinon = require('sinon');
const { expect } = require('chai');

describe('Logout handler test', () => {
  let fakeRequest;
  let h;

  let sandbox;
  let sessionServiceRevokeStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fakeRequest = {
      query: { backToPath: {} },
      auth: { artifacts: sinon.match.string },
      server: {
        methods: {
          idm: {
            generateAuthenticationUrl: sandbox.stub().returns('/authenticationUrl'),
          },
        },
      },
      cookieAuth: {
        request: {
          state: {
            idm: {},
          },
        },
        clear: sandbox.stub(),
      },
      claims: {
        userId: '5493d987-15cd-486b-8169-3ad1dd52178b',
        role: 'REACH_MANAGER',
      },
    };

    h = {
      unstate: sandbox.stub(),
      redirect: sandbox.stub(),
      view: sandbox.stub(),
    };

    sandbox.stub(sessionService, 'set');
    sandbox.stub(sessionService, 'get').withArgs('claims', fakeRequest).returns(fakeRequest.claims);
    sessionServiceRevokeStub = sandbox.stub(sessionService, 'revoke');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('logout unstate the crumb cookie, revoke session, clear cookieAuth and redirect to logout screen', async () => {
    const logout = logoutHandler.handlers().LOGOUT;

    await logout(fakeRequest, h);

    expect(h.unstate.calledWith('crumb')).to.be.true;
    expect(h.redirect.calledWith('/logged-out')).to.be.true;
    expect(fakeRequest.cookieAuth.clear.called).to.be.true;
    expect(sessionServiceRevokeStub.called).to.be.true;
  });

  it('loggedOut redirects to the correct view', async () => {
    const loggedOut = loggedOutHandler.handlers().GET;

    await loggedOut(fakeRequest, h);

    expect(h.view.called).to.be.true;
    expect(h.view.args[0][0]).equals('user/loggedOut');
  });
});
