const sessionService = require('../../src/services/session-service');
const sinon = require('sinon');
const { expect } = require('chai');

describe('Session Service Tests', () => {
  let sandbox;
  let request;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    request = {
      server: {
        yar: {
          revoke: sandbox.stub(),
        },
      },
      yar: {
        id: '869ffe8f-aaaf-42a8-9440-eb44c7ba0602',
        reset: sandbox.stub(),
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Revokes a session successfully and resets Yar', () => {
    sessionService.revoke(request);

    expect(request.server.yar.revoke.calledWith(request.yar.id)).to.be.true;
    expect(request.yar.reset.calledOnce).to.be.true;
  });

  it('Revokes a session successfully and does not reset Yar', () => {
    sessionService.revoke(request, false);

    expect(request.server.yar.revoke.calledWith(request.yar.id)).to.be.true;
    expect(request.yar.reset.notCalled).to.be.true;
  });
});
