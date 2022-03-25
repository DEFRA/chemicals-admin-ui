const { expect } = require('chai');
const messages = require('../../../src/messages.json');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');

const labels = { ...messages.banner.createBanner, ...messages.banner.common };

describe('Homepage banner view tests - create banner', () => {
  before(async () => {
    const html = await readFile('./src/views/customisation/create-banner.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('should display correct labels', () => {
    const result = this.template({
      labels,
      day: 'Day value',
      month: 'Month value',
      year: 'Year value',
      bannerContent: 'CONTENT',
    });

    expect(result).to.include(`<span class="govuk-caption-xl">${labels.caption}</span>`);
    expect(result).to.include(`<h1 class="govuk-heading-xl">${labels.heading}</h1>`);
    expect(result).to.include('<form method="POST" action="/banner/create">');
    expect(result).to.include(`<h1 class="govuk-fieldset__heading">${labels.startDate}</h1>`);
    expect(result).to.include(`<span class="govuk-hint" id="date-hint">${labels.startDateExample}</span>`);
    expect(result).to.include(`<label class="govuk-label govuk-date-input__label" for="day-entry">${labels.day}</label>`);
    expect(result).to.include('<input class="govuk-input govuk-date-input__input govuk-input--width-2" id="day-entry" name="day" type="text" pattern="[0-9]{1,2}" value="Day value" inputmode="numeric">');
    expect(result).to.include(`<label class="govuk-label govuk-date-input__label" for="month-entry">${labels.month}</label>`);
    expect(result).to.include('<input class="govuk-input govuk-date-input__input govuk-input--width-2" id="month-entry" name="month" type="text" pattern="[0-9]{1,2}" value="Month value" inputmode="numeric">');
    expect(result).to.include(`<label class="govuk-label govuk-date-input__label" for="year-entry">${labels.year}</label>`);
    expect(result).to.include('<input class="govuk-input govuk-date-input__input govuk-input--width-4" id="year-entry" name="year" type="text" pattern="[0-9]{4}" value="Year value" inputmode="numeric">');
    expect(result).to.include(`<label class="govuk-label govuk-label--m" for="banner-content">${labels.content}</label>`);
    expect(result).to.include(`<div id="more-detail-hint" class="govuk-hint">${labels.hint}</div>`);
    expect(result).to.include('<textarea class="govuk-textarea" id="banner-content" name="bannerContent" rows="20" aria-describedby="more-detail-hint">CONTENT</textarea>');
    expect(result).to.include(`<button class="govuk-button" data-module="govuk-button">${labels.confirm}</button>`);
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
