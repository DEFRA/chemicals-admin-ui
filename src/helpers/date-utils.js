const moment = require('moment');
const _ = require('lodash');
const messages = require('../messages');

/** @private */
const INVALID_YEAR = 'INVALID_YEAR';

/** @private */
const INVALID_MONTH = 'INVALID_MONTH';

/** @private */
const INVALID_DAY = 'INVALID_DAY';

/** @private */
const INVALID_DATE = 'INVALID_DATE';

/** @private */
const MISSING_DATE = 'MISSING_DATE';

/** @private */
const DATE_IN_PAST = 'DATE_IN_PAST';

const DATE_NOT_IN_FUTURE = 'DATE_NOT_IN_FUTURE';

/** @private */
const SUMMARY = 'SUMMARY';

/**
 * @param errorMessage
 * @return {string}
 */
const getErrorMessage = (errorMessage, page, isBanner) => {
  let displayErrors;

  if (isBanner) {
    displayErrors = messages[page].errors;
  } else {
    displayErrors = messages.settings[page].labels.errors;
  }

  if (_.includes([INVALID_YEAR, INVALID_MONTH, INVALID_DAY], errorMessage)) {
    return displayErrors[INVALID_DATE];
  }
  return displayErrors[errorMessage];
};

/**
 * @param field
 * @param errorMessage
 * @param page
 */
const getError = (field, errorMessage, page, isBanner) => {
  const error = {};
  error.field = field;
  error.detailedDescription = getErrorMessage(errorMessage, page, isBanner);
  error.description = getErrorMessage(SUMMARY, page, isBanner);
  return error;
};


/**
 * Checks if date1 is before date2
 *
 * @param {*} date1
 * @param {*} date2
 * @param {*} formId
 * @param {*} page
 * @param getErr callback function
 * @returns
 */
const isBefore = (date1, date2, formId, page, getErr = getError) => {
  if (!moment.isMoment(date1) || !moment.isMoment(date2)) {
    return getErr(formId, INVALID_DATE, page);
  } else if (date1.isBefore(date2)) {
    return getErr(formId, DATE_IN_PAST, page);
  }
  return null;
};

const isNotAfter = (date1, date2, formId, page, getErr = getError) => {
  if (!moment.isMoment(date1) || !moment.isMoment(date2)) {
    return getErr(formId, INVALID_DATE, page, true);
  } else if (!date1.isAfter(date2)) {
    return getErr(formId, DATE_NOT_IN_FUTURE, page, true);
  }

  return null;
};

/**
 * @param date
 * @param formId
 * @param page
 * @return {*}
 */
const isBeforeToday = (date, formId, page) => {
  const today = moment.utc().startOf('day');
  return isBefore(date, today, formId, page);
};

const isNotAfterToday = (date, formId, page) => {
  const today = moment.utc().startOf('day');
  return isNotAfter(date, today, formId, page);
};


/**
 * See https://momentjs.com/docs/#/parsing/is-valid/ and the return value from
 * the 'invalidAt' function.
 * @param date Moment date object
 * @return {*}
 */
const getErrorMessageForInvalidMomentDate = (date) => {
  switch (date.invalidAt()) {
    case 0:
      return INVALID_YEAR;
    case 1:
      return INVALID_MONTH;
    case 2:
      return INVALID_DAY;
    default:
      return INVALID_DATE;
  }
};

const getErrorField = (error, day, month, year) => {
  switch (error) {
    case INVALID_YEAR:
      return year;
    case INVALID_MONTH:
      return month;
    case INVALID_DAY:
      return day;
    default:
      return '';
  }
};

/**
 * Error messages returned:
 *  - INVALID_DATE: if the date passed in is not valid against the format provided.
 * @param date string
 * @param dayMarkupId string
 * @param monthMarkupId string
 * @param yearMarkupId string
 * @param format string
 * @param getErr callback function
 * @return {{ date: Moment|null, errors: [] }}
 */
const validate = (date, dayMarkupId, monthMarkupId, yearMarkupId, format, page, getErr = getError) => {
  const momentDate = moment.utc(date, format, true);
  if (!momentDate.isValid()) {
    const errorCode = getErrorMessageForInvalidMomentDate(momentDate);
    const field = getErrorField(errorCode, dayMarkupId, monthMarkupId, yearMarkupId);
    return {
      date: null,
      errors: [getErr(field, errorCode, page)],
    };
  }
  return {
    date: momentDate,
    errors: [],
  };
};

/**
 * @param data *
 * @param length number
 * @return {boolean}
 */
const validateLength = (data, length) => {
  if (_.isString(data)) {
    // formatted this way for readability
    const parsed = Number.parseInt(data, 10);
    if (Number.isNaN(parsed)) {
      return false;
    }
    return data.length <= length;
  }
  return false;
};

/**
 * Returns false if the length of 'year' is not 4 characters long.
 * E.g. 20181 or 20 will evaluate to false.
 * @param year
 * @return {boolean}
 */
const yearIsValidLength = (year) => {
  const validYearLength = 4;
  return year.length === validYearLength;
};

/**
 * Returns true if the length of 'month' is less than 2 characters long.
 * E.g. 301 will evaluate to false.
 * @param month
 * @return {boolean}
 */
const monthIsValidLength = month => validateLength(month, 2);

/**
 * Returns true if the length of 'day' is less than 2 characters long.
 * E.g. 301 will evaluate to false.
 * @param day
 * @return {boolean}
 */
const dayIsValidLength = day => validateLength(day, 2);


/**
 * @param {*} value
 * @returns {boolean}
 */
const stringIsDigit = value => /^\d+$/.test(value);

/**
 * @param day string
 * @param dayMarkupId string
 * @param month string
 * @param monthMarkupId string
 * @param year string
 * @param yearMarkupId string
 * @param formMarkupId string
 * @param getErr callback function
 * @return [*]
 */
const basicValidation = (
  day,
  dayMarkupId,
  month,
  monthMarkupId,
  year,
  yearMarkupId,
  formMarkupId,
  page,
  getErr = getError,
) => {
  if (_.isEmpty(day) || _.isEmpty(month) || _.isEmpty(year)) {
    return [
      getErr(formMarkupId, MISSING_DATE, page),
    ];
  }

  if (!yearIsValidLength(year) || !stringIsDigit(year)) {
    const error = getErr(yearMarkupId, INVALID_DATE, page);
    return [error];
  }
  if (!monthIsValidLength(month) || !stringIsDigit(month)) {
    const error = getErr(monthMarkupId, INVALID_DATE, page);
    return [error];
  }
  if (!dayIsValidLength(day) || !stringIsDigit(day)) {
    const error = getErr(dayMarkupId, INVALID_DATE, page);
    return [error];
  }
  return [];
};

module.exports = {
  validate,
  isBeforeToday,
  isBefore,
  basicValidation,
  isNotAfterToday,
};
