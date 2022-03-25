const { expect } = require('chai');
const messages = require('../../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');

const labels = { ...messages.banner.currentlyLive, ...messages.banner.common };

describe('Homepage banner view tests - live banner', () => {
  before(async () => {
    const html = await readFile('./src/views/customisation/live-banner.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('should display correct labels', () => {
    const result = this.template({
      labels,
      bannerContentComponents: 'CONTENT',
      banner: {
        createdAt: '2021-05-18T23:00:00.000Z',
      },
    });

    expect(result).to.include(`<span class="govuk-caption-xl">${labels.caption}</span>`);
    expect(result).to.include(`<h1 class="govuk-heading-xl">${labels.heading}</h1>`);
    expect(result).to.include(`<dt class="govuk-summary-list__key">${labels.bannerLastUpdated}</dt>`);
    expect(result).to.include('<dd class="govuk-summary-list__value">19 May 2021 at 00:00:00</dd>');
    expect(result).to.include('<dd class="govuk-summary-list__actions"></dd>');
    expect(result).to.include('<form method="POST" action="/banner/live">');
    expect(result).to.include(`<label class="govuk-label govuk-label--l" for="banner-content">${labels.content}</label>`);
    expect(result).to.include(`<div id="more-detail-hint" class="govuk-hint">${labels.hint}</div>`);
    expect(result).to.include('<textarea class="govuk-textarea" id="banner-content" name="bannerContent" rows="20" aria-describedby="more-detail-hint">CONTENT</textarea>');
    expect(result).to.include(`<button class="govuk-button" data-module="govuk-button">${labels.save}</button>`);
  });

  it('should display errors', () => {
    const result = this.template({
      errors: [{
        field: 'errorField',
        description: 'Error description',
      }],
    });

    expect(result).to.include('<li><a href="#errorField" class="govuk-link">Error description</a></li>');
  });
});
