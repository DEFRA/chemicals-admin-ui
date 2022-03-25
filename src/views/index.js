const Handlebars = require('handlebars');
const Path = require('path');

const messages = require('../messages');

const globalContext = {
  assetPath: '/public',
  serviceName: messages.general.header.serviceName,
  header: messages.general.header,
  footer: messages.general.footer,
};

module.exports = {
  engines: {
    html: Handlebars,
  },
  path: Path.join(__dirname, ''),
  partialsPath: Path.join(__dirname, 'partials/'),
  relativeTo: __dirname,
  layout: 'govuk-template',
  layoutPath: Path.join(__dirname, 'templates/'),
  context: globalContext,
};
