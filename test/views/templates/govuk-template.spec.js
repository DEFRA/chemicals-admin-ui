const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');
const { expect } = require('chai');
const messages = require('../../../src/messages');

describe('GOVUK Template Tests', () => {
  before(async () => {
    const html = await readFile('./src/views/templates/govuk-template.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('Should add the service name on to the title', () => {
    const result = this.template({
      title: 'Example Title',
      serviceName: messages.general.labels.header.serviceName,
    });

    expect(result).to.include(`Example Title - ${messages.general.labels.header.serviceName}`);
  });
});
