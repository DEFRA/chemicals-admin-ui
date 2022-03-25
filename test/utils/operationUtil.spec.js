const sinon = require('sinon');
const operationUtil = require('../../src/utils/operationUtil');
const { CorrelationContextManager } = require('applicationinsights/out/AutoCollection/CorrelationContextManager');
const { expect } = require('chai');

describe('operationUtil test suite', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(CorrelationContextManager, 'getCurrentContext').returns({
      operation: {
        id: '2a320e0d-044e-417c-934b-edecf5d07aef',
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return operation id', () => {
    expect(operationUtil.getOperationId()).to.equal('2a320e0d-044e-417c-934b-edecf5d07aef');
  });
});

