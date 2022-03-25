const handlebars = require('handlebars');
const moment = require('moment-timezone');
const _ = require('lodash');

const formattedBriefDateWithTimeWithTimezone = (date) => {
  if (!date) { return ''; }
  date = moment.utc(date);
  if (date.isValid()) {
    const formattedDate = date.tz('Europe/London').format('DD MMM YYYY');
    const time = date.format('HH:mm:SS');
    return `${formattedDate} at ${time}`;
  }
  return '--';
};

/**
 * Formats the feature toggles enabled value to ON or OFF
 */
handlebars.registerHelper('formatFeatureToggleEnabled', (arg1, options) => (arg1 ? 'ON' : 'OFF'));

handlebars.registerHelper('isError', (errors, field, options) => {
  if (!Array.isArray(errors)) {
    return options.inverse(this);
  }
  return errors.find(error => error.field === field) ? options.fn(this) : options.inverse(this);
});

/* eslint func-names: ["error", "never"] */
handlebars.registerHelper('isErrors', function (errors, options) {
  return !_.isEmpty(errors) ? options.fn(this) : options.inverse(this);
});

/**
 * Performs a strict check on the 2 arguments passed in .
 * @param {*} arg1
 * @param {*} arg2
 * @param {*} options
 * @returns bool
 */
handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

/**
 * Checks if the array passed in as parameter 1 contains any of the indefinite
 * amount of values passed. Returns the first item found in the array.
 * Usage: {{#ifErrorsArrayContains array 'value1' 'value2' 'value3'}} ... {{/ifErrorsArrayContains}}
 * @param array
 * @param values
 * @return handlebars options
 */
handlebars.registerHelper('ifErrorsArrayContains', (...args) => {
  const options = args.pop();
  const errors = args[0];
  const params = args.slice(1, args.length);

  if (Array.isArray(errors)) {
    const candidateError = errors.find(error => params.includes(error.field));
    if (candidateError) {
      return options.fn(candidateError);
    }
  }
  return options.inverse(this);
});

handlebars.registerHelper('isEmpty', function (arg, options) {
  return (arg === undefined) || (arg === null) ||
  (Array.isArray(arg) && !arg.length) ||
  ((typeof arg === 'object') && !Object.keys(arg).length) ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('formattedBriefDateWithTimeWithTimezone', dateString => formattedBriefDateWithTimeWithTimezone(dateString));

handlebars.registerHelper('getErrorDetailedDescription', (errors, field) => errors.filter(error => error.field === field)[0].detailedDescription);

handlebars.registerHelper('csrf', crumb => `<input type="hidden" name="crumb" value=${crumb}>`);

