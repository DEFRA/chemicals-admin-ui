const { expect } = require('chai');
const messages = require('../../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');

const labels = { ...messages.banner.bannerSaved, ...messages.banner.common };

describe('Homepage banner view tests - banner saved', () => {
  before(async () => {
    const html = await readFile('./src/views/customisation/banner-saved.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('should display correct labels', () => {
    const result = this.template({
      labels,
    });

    expect(result).to.include(`<span class="govuk-caption-xl">${labels.caption}</span>`);
    expect(result).to.include(`<h1 class="govuk-heading-xl">'${labels.currentlyLive}' ${labels.saved}.</h1>`);
    expect(result).to.include(`<p id="updated-message" class="govuk-body">'${labels.currentlyLive}' ${labels.hasBeenSaved}</p>`);
    expect(result).to.include(`<p id="settings-message" class="govuk-body">${labels.goTo} <a class="govuk-link" id="settings-link" href="/homepage">${labels.settings}</a></p>`);
  });
});
