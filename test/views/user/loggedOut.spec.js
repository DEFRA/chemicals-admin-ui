const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const Handlebars = require('handlebars');
const { expect } = require('chai');
const messages = require('../../../src/messages');

describe('Admin User logged out page', () => {
  before(async () => {
    const html = await readFile('./src/views/user/loggedOut.html');
    this.template = Handlebars.compile(html.toString());
  });

  it('shows correct content', () => {
    const result = this.template({
      labels: messages.logoutView.labels,
    });

    expect(result).to.include(messages.logoutView.labels.heading);
  });
});
