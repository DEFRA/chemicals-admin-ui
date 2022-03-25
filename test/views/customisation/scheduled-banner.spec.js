const { expect } = require('chai');
const messages = require('../../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');

const labels = { ...messages.banner.scheduledBanner, ...messages.banner.common };

describe('Homepage banner view tests - scheduled banner', () => {
  before(async () => {
    const html = await readFile('./src/views/customisation/scheduled-banner.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('should display correct labels', () => {
    const configurableContentId = 'cb3e31b8-dfc4-4726-a8d9-dba9101ff2dd';

    const result = this.template({
      labels,
      bannerContentComponents: 'CONTENT',
      banner: {
        configurableContentId,
        validFrom: '2021-05-18T23:00:00.000Z',
      },
    });

    expect(result).to.include(`<span class="govuk-caption-xl">${labels.caption}</span>`);
    expect(result).to.include(`<h1 class="govuk-heading-xl">${labels.heading} 19 May 2021 at 00:00:00</h1>`);
    expect(result).to.include(`<form method="POST" action="/banner/${configurableContentId}/delete">`);
    expect(result).to.include(`<label class="govuk-label govuk-label--l" for="banner-content">${labels.content}</label>`);
    expect(result).to.include(`<div id="more-detail-hint" class="govuk-hint">${labels.hint}</div>`);
    expect(result).to.include('<textarea class="govuk-textarea" id="banner-content" name="bannerContent" rows="20" aria-describedby="more-detail-hint">CONTENT</textarea>');
    expect(result).to.include(`<button class="govuk-button govuk-button--secondary" data-module="govuk-button">${labels.deleteAndUnscheduleBanner}</button>`);
  });
});
