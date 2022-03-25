const { expect } = require('chai');
const messages = require('../../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');

const labels = { ...messages.banner.bannerCreated, ...messages.banner.common };

describe('Homepage banner view tests - banner created', () => {
  before(async () => {
    const html = await readFile('./src/views/customisation/banner-created.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('should display correct labels', () => {
    const result = this.template({
      labels,
      validFrom: '2021-05-18T23:00:00.000Z',
    });

    expect(result).to.include(`<span class="govuk-caption-xl">${labels.caption}</span>`);
    expect(result).to.include(`<h1 class="govuk-heading-xl">'${labels.scheduledFor} 19 May 2021 at 00:00:00' ${labels.created}</h1>`);
    expect(result).to.include(`<p id="updated-message" class="govuk-body">'${labels.scheduledFor} 19 May 2021 at 00:00:00' ${labels.hasBeenCreated} 19 May 2021 at 00:00:00</p>`);
    expect(result).to.include(`<p id="settings-message" class="govuk-body">${labels.goTo} <a class="govuk-link" id="settings-link" href="/homepage">${labels.settings}</a>.</p>`);
  });
});
