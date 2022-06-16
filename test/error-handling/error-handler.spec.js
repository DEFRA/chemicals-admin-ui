const sinon = require('sinon');
const chai = require('chai');
const errorHandler = require('../../src/error-handling/error-handler');
const errorReference = require('../../src/utils/errorReference');
chai.use(require('sinon-chai'));

const { expect } = chai;

describe('Error handler', () => {
  let sandbox;
  let h;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(errorReference, 'getErrorReference').returns('an-error-reference');

    h = {
      view: sandbox.stub(),
      code: sandbox.stub(),
      header: sandbox.stub(),
    };
    h.view.returns(h);
    h.code.returns(h);
    h.header.returns(h);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should handle 5xx errors', () => {
    const request = {
      auth: {
        isAuthenticated: true,
      },
      response: {
        isServer: true,
      },
    };

    const result = errorHandler.handleBoomError(request, h);

    expect(result).to.eq(h);
    expect(h.view).to.have.been.calledWithMatch('5XX', {
      'error-phrase': 'an-error-reference',
    });
    expect(h.code).to.have.been.calledWith(500);
  });

  it('should handle non 5xx errors', () => {
    const request = {
      auth: {
        isAuthenticated: true,
      },
      response: {
        isServer: false,
      },
    };

    const result = errorHandler.handleBoomError(request, h);

    expect(result).to.eq(h);
    expect(h.view).to.have.been.calledWithMatch('404', {});
    expect(h.code).to.have.been.calledWith(404);
  });
});
