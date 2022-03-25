const sinon = require('sinon');
const operationUtil = require('../../src/utils/operationUtil');
const errorReference = require('../../src/utils/errorReference');
const { expect } = require('chai');

describe('errorReference test suite', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(operationUtil, 'getOperationId').returns('2a320e0d-044e-417c-934b-edecf5d07aef');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return hyphenated words for guid', () => {
    expect(errorReference.getErrorReference()).to.equal('vote-economic-life-every');
  });
});

