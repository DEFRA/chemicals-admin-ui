require('../../src/helpers/viewHelpers');

const featureToggleService = require('../../src/services/feature-toggle-service');
const configurableContentService = require('../../src/services/configurable-content-service');
const messages = require('../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');
const { expect } = require('chai');
const sinon = require('sinon');

const { handlers } = require('../../src/routes/handlers/homepage');

const sandbox = sinon.createSandbox();

function getTemplateData(viewSpy, call = 0) {
  const [template, data] = viewSpy.args[call];
  return {
    template,
    data,
  };
}

describe('Homepage Handler Tests', () => {
  const { GET } = handlers();

  beforeEach(() => {
    sandbox.stub(configurableContentService, 'getLatestContents').returns({});
    sandbox.stub(featureToggleService, 'getFeatureToggles').resolves({
      data: [
        {
          id: 'ba80e65b-41de-4ccc-b388-f23330842cf2',
          name: 'Enabled Date Based Test Feature Toggle',
          enabled: true,
          featureToggleActivationStrategy: {
            '@type': 'FROM_DATE',
            dateActiveFrom: '2021-01-01',
          },
          description: 'This feature toggle is enabled',
        },
        {
          id: 'b57be26c-eaa6-4402-a542-373466b41852',
          name: 'Disabled Simple Test Feature Toggle',
          enabled: false,
          featureToggleActivationStrategy: {
            '@type': 'SIMPLE',
          },
          description: 'This simple feature toggle is disabled',
        },
      ],
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('GET Handler', async () => {
    const request = {};
    const viewFunc = sinon.spy();
    const h = { view: viewFunc };

    await GET(request, h);

    const { template, data } = getTemplateData(viewFunc);
    expect(template).to.equal('homepage');
    expect(data.title).to.equal('Homepage');

    expect(data.featureToggles.data[0].id).to.equal('ba80e65b-41de-4ccc-b388-f23330842cf2');
    expect(data.featureToggles.data[0].name).to.equal('Enabled Date Based Test Feature Toggle');
    expect(data.featureToggles.data[0].enabled).to.equal(true);
    expect(data.featureToggles.data[0].featureToggleActivationStrategy['@type']).to.equal('FROM_DATE');
    expect(data.featureToggles.data[0].featureToggleActivationStrategy.dateActiveFrom).to.equal('2021-01-01');
    expect(data.featureToggles.data[0].description).to.equal('This feature toggle is enabled');

    expect(data.featureToggles.data[1].id).to.equal('b57be26c-eaa6-4402-a542-373466b41852');
    expect(data.featureToggles.data[1].name).to.equal('Disabled Simple Test Feature Toggle');
    expect(data.featureToggles.data[1].enabled).to.equal(false);
    expect(data.featureToggles.data[1].featureToggleActivationStrategy['@type']).to.equal('SIMPLE');
    expect(data.featureToggles.data[1].description).to.equal('This simple feature toggle is disabled');
  });
});

describe('Homepage HTML Tests', () => {
  const { labels } = messages.homepage;

  before(async () => {
    const html = await readFile('./src/views/homepage.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('Should display feature toggles on Homepage', async () => {
    const result = this.template({
      featureToggles: [
        {
          id: 'ba80e65b-41de-4ccc-b388-f23330842cf2',
          name: 'Enabled Date Based Test Feature Toggle',
          enabled: true,
          featureToggleActivationStrategy: {
            '@type': 'FROM_DATE',
            dateActiveFrom: '2021-01-01',
          },
          description: 'This feature toggle is enabled',
        },
        {
          id: '1cca314a-64fb-4e6f-8718-abe0f768e676',
          name: 'Disabled Date Based Test Feature Toggle',
          enabled: false,
          featureToggleActivationStrategy: {
            '@type': 'FROM_DATE',
            dateActiveFrom: '2031-01-01',
          },
          description: 'This feature toggle is disabled',
        },
        {
          id: '60eeda13-5a1e-43c3-89c9-536c9c62b311',
          name: 'Enabled Simple Test Feature Toggle',
          enabled: true,
          featureToggleActivationStrategy: {
            '@type': 'SIMPLE',
          },
          description: 'This simple feature toggle is enabled',
        },
        {
          id: 'b57be26c-eaa6-4402-a542-373466b41852',
          name: 'Disabled Simple Test Feature Toggle',
          enabled: false,
          featureToggleActivationStrategy: {
            '@type': 'SIMPLE',
          },
          description: 'This simple feature toggle is disabled',
        },
      ],
      labels: messages.homepage.labels,
    });

    expect(result).to.include(Handlebars.escapeExpression(labels.featureToggles.heading));
    expect(result).to.include(Handlebars.escapeExpression(labels.featureToggles.table.caption));
    expect(result).to.include(Handlebars.escapeExpression(labels.featureToggles.table.heading.feature));
    expect(result).to.include(Handlebars.escapeExpression(labels.featureToggles.table.heading.condition));
    expect(result).to.include(Handlebars.escapeExpression(labels.featureToggles.table.body.showAfter));

    expect(result).to.include('Enabled Date Based Test Feature Toggle');
    expect(result).to.include('Show after 2021-01-01');
    expect(result).to.include('href="/feature-toggle/ba80e65b-41de-4ccc-b388-f23330842cf2"');
    expect(result).to.include('<strong class="status ON">ON</strong>');
    expect(result).to.include('This feature toggle is enabled');

    expect(result).to.include('Disabled Date Based Test Feature Toggle');
    expect(result).to.include('Show after 2031-01-01');
    expect(result).to.include('href="/feature-toggle/1cca314a-64fb-4e6f-8718-abe0f768e676"');
    expect(result).to.include('<strong class="status OFF">OFF</strong>');
    expect(result).to.include('This feature toggle is disabled');

    expect(result).to.include('Enabled Simple Test Feature Toggle');
    expect(result).to.include('href="/feature-toggle/60eeda13-5a1e-43c3-89c9-536c9c62b311"');
    expect(result).to.include('<strong class="status ON">ON</strong>');
    expect(result).to.include('This simple feature toggle is enabled');

    expect(result).to.include('Disabled Simple Test Feature Toggle');
    expect(result).to.include('href="/feature-toggle/b57be26c-eaa6-4402-a542-373466b41852"');
    expect(result).to.include('<strong class="status OFF">OFF</strong>');
    expect(result).to.include('This simple feature toggle is disabled');
  });

  it('Should display live banner and scheduled banners on Homepage', async () => {
    const result = this.template({
      scheduledBanners: [
        {
          configurableContentId: 'c05f0379-f9ce-443d-920e-2aedcbc51b83',
          validFrom: '2021-05-18T23:00:00.000Z',
        },
        {
          configurableContentId: '3b53e8e2-fe16-435b-828f-4e1e8fcc54df',
          validFrom: '2021-05-24T23:00:00.000Z',
        },
      ],
      labels: messages.homepage.labels,
    });

    expect(result).to.include(`<h1 class="govuk-heading-xl">${labels.homepageBanner.heading}</h1>`);
    expect(result).to.include(`<h3 class="govuk-heading-s">${labels.homepageBanner.currentlyLive}</h3>`);
    expect(result).to.include(`<a class="govuk-link" href="/banner/live">${labels.homepageBanner.currentlyLive}</a>`);
    expect(result).to.include(`<h3 class="govuk-heading-s">${labels.homepageBanner.scheduled}</h3>`);

    expect(result).to.not.include(`<p class="govuk-body">${labels.homepageBanner.noScheduledBanners}</p>`);

    expect(result).to.includes(`<a class="govuk-link" href="/banner/c05f0379-f9ce-443d-920e-2aedcbc51b83">${labels.homepageBanner.scheduledFor} 19 May 2021 at 00:00:00</a>`);
    expect(result).to.includes(`<a class="govuk-link" href="/banner/3b53e8e2-fe16-435b-828f-4e1e8fcc54df">${labels.homepageBanner.scheduledFor} 25 May 2021 at 00:00:00</a>`);
  });

  it('Should display live banner and scheduled banners on Homepage - no scheduled banners', async () => {
    const result = this.template({
      scheduledBanners: [],
      labels: messages.homepage.labels,
    });

    expect(result).to.include(`<h1 class="govuk-heading-xl">${labels.homepageBanner.heading}</h1>`);
    expect(result).to.include(`<h3 class="govuk-heading-s">${labels.homepageBanner.currentlyLive}</h3>`);
    expect(result).to.include(`<a class="govuk-link" href="/banner/live">${labels.homepageBanner.currentlyLive}</a>`);
    expect(result).to.include(`<h3 class="govuk-heading-s">${labels.homepageBanner.scheduled}</h3>`);
    expect(result).to.include(`<p class="govuk-body">${labels.homepageBanner.noScheduledBanners}</p>`);

    expect(result).to.not.include(`<a class="govuk-link" href="/banner/c05f0379-f9ce-443d-920e-2aedcbc51b83">${labels.homepageBanner.scheduledFor} 19 May 2021 at 00:00:00</a>`);
    expect(result).to.not.include(`<a class="govuk-link" href="/banner/3b53e8e2-fe16-435b-828f-4e1e8fcc54df">${labels.homepageBanner.scheduledFor} 25 May 2021 at 00:00:00</a>`);
  });
});
