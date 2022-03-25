const loginHandler = require('../../../../src/routes/handlers/login/login');
const sinon = require('sinon');
const { expect } = require('chai');

describe('login handler test', () => {
  let sandbox;
  let fakeRequest;
  let stubH;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stubH = {
      redirect: sandbox.stub(),
      view: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('login checks LOGIN handler returns auth redirect if not authenticated', async () => {
    fakeRequest = {
      auth: {
        isAuthenticated: false,
      },
    };

    const login = loginHandler.handlers().LOGIN;

    await login(fakeRequest, stubH);

    expect(stubH.redirect.calledWith('/auth')).to.be.true;
  });

  it('login checks LOGIN handler returns dashboard redirect if authenticated', async () => {
    fakeRequest = {
      auth: {
        isAuthenticated: true,
        credentials: {
          profile: {
            id: '70 71 72 73 74',
            email: 'admin.user@hse.gov.uk',
            displayName: 'Admin User',
          },
        },
      },
      cookieAuth: {
        set: sandbox.stub(),
      },
      yar: {
        set: sandbox.stub(),
      },
    };

    const login = loginHandler.handlers().LOGIN;

    await login(fakeRequest, stubH);

    expect(stubH.redirect.calledWith('/homepage')).to.be.true;
  });
});
