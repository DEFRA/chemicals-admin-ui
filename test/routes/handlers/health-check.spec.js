const sinon = require('sinon');
const chai = require('chai');
const healthCheck = require('../../../src/routes/handlers/health-check');
chai.use(require('sinon-chai'));

const { expect } = chai;

describe('Healthcheck handler', () => {
  let request;
  let sandbox;
  let h;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    h = {
      response: sandbox.stub(),
      code: sandbox.stub(),
    };
    h.response.returns(h);
    h.code.returns(h);

    request = {
      server: {
        healthchecks: [],
        app: {
          version: 'version99',
        },
      },
    };
  });

  it('should return version in response', async () => {
    await healthCheck.handlers().GET(request, h);
    expect(h.response).to.have.been.calledWithMatch({
      version: 'version99',
    });
  });

  it('should return HEALTHY if all healthchecks are HEALTHY', async () => {
    request.server.healthchecks.push({
      getHealthReport: sinon.stub().returns(Promise.resolve([{
        dependency: 'dep1',
        status: 'HEALTHY',
      }])),
    });
    request.server.healthchecks.push({
      getHealthReport: sinon.stub().returns(Promise.resolve([{
        dependency: 'dep2a',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2b',
        status: 'HEALTHY',
      }])),
    });
    await healthCheck.handlers().GET(request, h);
    expect(h.response).to.have.been.calledWithMatch({
      health: 'HEALTHY',
      details: [{
        dependency: 'dep1',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2a',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2b',
        status: 'HEALTHY',
      }],
    });
    expect(h.code).to.have.been.calledWith(200);
  });

  it('should return UNHEALTHY if one healthcheck is UNHEALTHY', async () => {
    request.server.healthchecks.push({
      getHealthReport: sinon.stub().returns(Promise.resolve([{
        dependency: 'dep1',
        status: 'HEALTHY',
      }])),
    });
    request.server.healthchecks.push({
      getHealthReport: sinon.stub().returns(Promise.resolve([{
        dependency: 'dep2a',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2b',
        status: 'UNHEALTHY',
      }])),
    });
    await healthCheck.handlers().GET(request, h);
    expect(h.response).to.have.been.calledWithMatch({
      health: 'UNHEALTHY',
      details: [{
        dependency: 'dep1',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2a',
        status: 'HEALTHY',
      }, {
        dependency: 'dep2b',
        status: 'UNHEALTHY',
      }],
    });
    expect(h.code).to.have.been.calledWith(500);
  });
});
