const sinon = require('sinon');
const { expect } = require('chai');
const config = require('../../src/config.js');
const httpClient = require('../../src/services/http-client');
const featureToggleService = require('../../src/services/feature-toggle-service');

const request = {
  userAccount: {},
  headers: {},
  info: {},
};

describe('Feature Toggle Service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should get a list of feature toggles', async () => {
    const featureToggles = [
      {
        id: '4661ee97-6f75-499b-a788-08d224d2381a',
        name: 'INTERMEDIATE_GROUPS',
        description: 'This is a placeholder feature toggle description that should hopefully span multiple lines by giving a description of what the feature toggle actually does.',
        featureToggleActivationStrategy: {
          type: 'FROM_DATE',
          dateActiveFrom: '2021-05-01',
        },
      },
      {
        id: '2a838051-b4fd-439b-8aa5-357c28418ded',
        name: 'CAN_SUBMIT_GRANDFATHERED',
        description: 'Placeholder feature toggle description.',
        featureToggleActivationStrategy: {
          type: 'SIMPLE',
        },
      },
      {
        id: '183dd842-32ac-4b90-a57b-fdf30a925600',
        name: 'CLAIM_LEAD',
        description: 'Placeholder feature toggle description.',
        featureToggleActivationStrategy: {
          type: 'FROM_DATE',
          dateActiveFrom: '2021-05-01',
        },
      },
    ];

    sinon.stub(httpClient, 'GET').returns({ data: featureToggles });
    const returnedFeatureToggles = await featureToggleService.getFeatureToggles(request);

    expect(returnedFeatureToggles).to.equal(featureToggles);
    expect(httpClient.GET.firstCall.args[1].url).to.equal(`${config.REACH_API}/feature-toggle`);
  });

  it('should get an individual feature toggle', async () => {
    const featureToggle = [
      {
        id: '4661ee97-6f75-499b-a788-08d224d2381a',
        name: 'INTERMEDIATE_GROUPS',
        description: 'This is a placeholder feature toggle description that should hopefully span multiple lines by giving a description of what the feature toggle actually does.',
        featureToggleActivationStrategy: {
          type: 'FROM_DATE',
          dateActiveFrom: '2021-05-01',
        },
      },
    ];

    sinon.stub(httpClient, 'GET').returns({ data: featureToggle });
    const returnedFeatureToggle = await featureToggleService.getFeatureToggle(request, featureToggle[0].id);

    expect(returnedFeatureToggle).to.equal(featureToggle);
    expect(httpClient.GET.firstCall.args[1].url).to.equal(`${config.REACH_API}/feature-toggle/${featureToggle[0].id}`);
  });
});
