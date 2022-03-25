const { expect } = require('chai');
const sinon = require('sinon');
const { OK } = require('http-status');
const { JSDOM } = require('jsdom');
const testServer = require('../../../test-server');
const messages = require('../../../../src/messages');
const {
  assertTextOnElementNode, assertContainsText, assertExcludesText,
  assertPageTitle, assertHrefValueOnElementNode, assertClassOnElementNode,
} = require('../../../utils/assertionHelpers');
const featureToggleService = require('../../../../src/services/feature-toggle-service');
require('../../../../src/helpers/viewHelpers');

let server;

before(async () => {
  server = await testServer.init();
});

after(async () => {
  await server.stop({ timeout: 10000 });
});

describe('Feature Toggle handler tests', () => {
  const featureToggleFromDate = {
    id: 'e57fc756-7f05-4ba0-91e6-a0f9c180cec6',
    name: 'CLAIM_LEAD',
    enabled: true,
    description: 'from-date based feature toggle description',
    featureToggleActivationStrategy: {
      '@type': 'FROM_DATE',
      dateActiveFrom: '2021-05-01',
    },
  };

  const featureToggleBeforeDate = {
    id: 'a57fc756-7f05-4ba0-91e6-a0f9c180cec6',
    name: 'CLAIM_LEAD',
    enabled: true,
    description: 'before-date based feature toggle description',
    featureToggleActivationStrategy: {
      '@type': 'BEFORE_DATE',
      dateActiveBefore: '2022-05-01',
    },
  };

  const featureToggleSimple = {
    id: 'b57fc756-7f05-4ba0-91e6-a0f9c180cec6',
    name: 'CLAIM_LEAD',
    enabled: false,
    description: 'simple feature toggle description',
    featureToggleActivationStrategy: {
      '@type': 'SIMPLE',
    },
  };

  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it('Loads the page and populates fields correctly using current configuration for from-date based toggle', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleFromDate.id}`,
      method: 'GET',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleFromDate);
    const response = await server.injectWithFormDataPayload(injectOptions, {}, OK);
    const { labels, title } = messages.settings.featureToggles;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name}`);
    assertTextOnElementNode(document, labels.description, 'description-label');
    assertTextOnElementNode(document, featureToggleFromDate.description, 'feature-toggle-description');
    assertContainsText(response.result, 'id="day-entry"');
    assertContainsText(response.result, 'value="01"');
    assertContainsText(response.result, 'id="month-entry"');
    assertContainsText(response.result, 'value="05"');
    assertContainsText(response.result, 'id="year-entry"');
    assertContainsText(response.result, 'value="2021"');
    assertContainsText(response.result, 'value="true" checked>');
    assertContainsText(response.result, 'value="false" >');
  });

  it('Loads the page and populates fields correctly using current configuration for before-date based toggle', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleFromDate.id}`,
      method: 'GET',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleBeforeDate);
    const response = await server.injectWithFormDataPayload(injectOptions, {}, OK);
    const { labels, title } = messages.settings.featureToggles;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleBeforeDate.name}`);
    assertTextOnElementNode(document, labels.description, 'description-label');
    assertTextOnElementNode(document, featureToggleBeforeDate.description, 'feature-toggle-description');
    assertContainsText(response.result, 'id="day-entry"');
    assertContainsText(response.result, 'value="01"');
    assertContainsText(response.result, 'id="month-entry"');
    assertContainsText(response.result, 'value="05"');
    assertContainsText(response.result, 'id="year-entry"');
    assertContainsText(response.result, 'value="2022"');
    assertContainsText(response.result, 'value="true" checked>');
    assertContainsText(response.result, 'value="false" >');
  });

  it('Loads the page and populates fields correctly using current configuration for simple toggle', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleFromDate.id}`,
      method: 'GET',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleSimple);
    const response = await server.injectWithFormDataPayload(injectOptions, {}, OK);
    const { labels, title } = messages.settings.featureToggles;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name}`);
    assertTextOnElementNode(document, labels.description, 'description-label');
    assertTextOnElementNode(document, featureToggleSimple.description, 'feature-toggle-description');
    assertExcludesText(response.result, 'id="day-entry"');
    assertExcludesText(response.result, 'id="month-entry"');
    assertExcludesText(response.result, 'id="year-entry"');
    assertContainsText(response.result, 'value="true" >');
    assertContainsText(response.result, 'value="false" checked>');
  });

  it('Updates a simple toggle with new configuration correctly', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleSimple.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'New Description',
      featureToggleStatus: 'false',
    };

    const updatedFeatureToggle = {
      id: featureToggleSimple.id,
      name: featureToggleSimple.name,
      description: payload.featureToggleDescription,
      enabled: payload.featureToggleStatus === 'true',
      featureToggleActivationStrategy: featureToggleSimple.featureToggleActivationStrategy,
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleSimple);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.calledOnce).to.be.true;
    expect(featureToggleService.updateFeatureToggle.calledWith(sinon.match.any, featureToggleSimple.id, updatedFeatureToggle)).to.be.true;
    const { labels, title, titleEnd } = messages.settings.featureTogglesSuccess;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name} ${titleEnd}`);
    assertTextOnElementNode(document, labels.hasBeenUpdated, 'updated-message');
    assertTextOnElementNode(document, labels.goTo, 'settings-message');
    assertTextOnElementNode(document, labels.settings, 'settings-message');
    assertHrefValueOnElementNode(document, '/homepage', 'settings-link');
  });

  it('Updates a from-date based toggle with new configuration correctly', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleFromDate.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'New Description',
      featureToggleStatus: 'true',
      day: '30',
      month: '8',
      year: '2035',
    };

    const updatedActivationStrategy = {
      '@type': 'FROM_DATE',
      dateActiveFrom: '2035-08-30',
    };

    const updatedFeatureToggle = {
      id: featureToggleFromDate.id,
      name: featureToggleFromDate.name,
      description: payload.featureToggleDescription,
      enabled: payload.featureToggleStatus === 'true',
      featureToggleActivationStrategy: updatedActivationStrategy,
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleFromDate);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.calledOnce).to.be.true;
    expect(featureToggleService.updateFeatureToggle.calledWith(sinon.match.any, featureToggleFromDate.id, updatedFeatureToggle)).to.be.true;
    const { labels, title, titleEnd } = messages.settings.featureTogglesSuccess;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name} ${titleEnd}`);
    assertTextOnElementNode(document, labels.hasBeenUpdated, 'updated-message');
    assertTextOnElementNode(document, labels.goTo, 'settings-message');
    assertTextOnElementNode(document, labels.settings, 'settings-message');
    assertHrefValueOnElementNode(document, '/homepage', 'settings-link');
  });

  it('Updates a before-date based toggle with new configuration correctly', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleBeforeDate.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'New Before Date Description',
      featureToggleStatus: 'true',
      day: '30',
      month: '8',
      year: '2035',
    };

    const updatedActivationStrategy = {
      '@type': 'BEFORE_DATE',
      dateActiveBefore: '2035-08-30',
    };

    const updatedBeforeDateFeatureToggle = {
      id: featureToggleBeforeDate.id,
      name: featureToggleBeforeDate.name,
      enabled: payload.featureToggleStatus === 'true',
      description: payload.featureToggleDescription,
      featureToggleActivationStrategy: updatedActivationStrategy,
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleBeforeDate);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.calledOnce).to.be.true;
    expect(featureToggleService.updateFeatureToggle.calledWith(sinon.match.any, 'a57fc756-7f05-4ba0-91e6-a0f9c180cec6', updatedBeforeDateFeatureToggle)).to.be.true;

    const { labels, title, titleEnd } = messages.settings.featureTogglesSuccess;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleBeforeDate.name} ${titleEnd}`);
    assertTextOnElementNode(document, labels.hasBeenUpdated, 'updated-message');
    assertTextOnElementNode(document, labels.goTo, 'settings-message');
    assertTextOnElementNode(document, labels.settings, 'settings-message');
    assertHrefValueOnElementNode(document, '/homepage', 'settings-link');
  });

  it('Gives error if a date based toggle uses a date in the past', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleSimple.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'New Description',
      featureToggleStatus: 'true',
      day: '30',
      month: '8',
      year: '2020',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleFromDate);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.notCalled).to.be.true;
    const { labels, title } = messages.settings.featureToggles;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${labels.error}: ${title} ${featureToggleFromDate.name}`);
    assertTextOnElementNode(document, labels.description, 'description-label');
    assertTextOnElementNode(document, payload.featureToggleDescription, 'feature-toggle-description');
    assertClassOnElementNode(document, 'govuk-form-group--error', 'date-input');
    assertTextOnElementNode(document, labels.errors.DATE_IN_PAST, 'error-message');
    assertContainsText(response.result, 'id="day-entry"');
    assertContainsText(response.result, 'value="30"');
    assertContainsText(response.result, 'id="month-entry"');
    assertContainsText(response.result, 'value="8"');
    assertContainsText(response.result, 'id="year-entry"');
    assertContainsText(response.result, 'value="2020"');
    assertContainsText(response.result, 'value="true" checked>');
    assertContainsText(response.result, 'value="false" >');
  });

  it('Updates a date based toggle correctly when date is in the past and the toggle is disabled', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleSimple.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'Feature Toggle Description',
      featureToggleStatus: 'false',
      day: '30',
      month: '8',
      year: '2020',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleFromDate);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.calledOnce).to.be.true;
    const { labels, title, titleEnd } = messages.settings.featureTogglesSuccess;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name} ${titleEnd}`);
    assertTextOnElementNode(document, labels.hasBeenUpdated, 'updated-message');
    assertTextOnElementNode(document, labels.goTo, 'settings-message');
    assertTextOnElementNode(document, labels.settings, 'settings-message');
    assertHrefValueOnElementNode(document, '/homepage', 'settings-link');
  });

  it('Gives error if a date based toggle uses an invalid date', async () => {
    const injectOptions = {
      url: `/feature-toggle/${featureToggleSimple.id}`,
      method: 'POST',
    };

    const payload = {
      featureToggleDescription: 'New Description',
      featureToggleStatus: 'true',
      day: '30',
      month: '28',
      year: '2020',
    };

    sandbox.stub(featureToggleService, 'getFeatureToggle').returns(featureToggleFromDate);
    sandbox.stub(featureToggleService, 'updateFeatureToggle');
    const response = await server.injectWithFormDataPayload(injectOptions, payload, OK);
    expect(featureToggleService.updateFeatureToggle.notCalled).to.be.true;
    const { labels, title } = messages.settings.featureToggles;

    const { document } = new JSDOM(response.result).window;
    assertPageTitle(document, `${title} ${featureToggleFromDate.name}`);
    assertTextOnElementNode(document, labels.description, 'description-label');
    assertTextOnElementNode(document, payload.featureToggleDescription, 'feature-toggle-description');
    assertClassOnElementNode(document, 'govuk-form-group--error', 'date-input');
    assertTextOnElementNode(document, labels.errors.INVALID_DATE, 'error-message');
    assertContainsText(response.result, 'id="day-entry"');
    assertContainsText(response.result, 'value="30"');
    assertContainsText(response.result, 'id="month-entry"');
    assertContainsText(response.result, 'value="28"');
    assertContainsText(response.result, 'id="year-entry"');
    assertContainsText(response.result, 'value="2020"');
    assertContainsText(response.result, 'value="true" checked>');
    assertContainsText(response.result, 'value="false" >');
  });
});
