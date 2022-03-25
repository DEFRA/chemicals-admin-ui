const messages = require('../../../messages');
const featureToggleService = require('../../../services/feature-toggle-service');
const dateUtils = require('../../../helpers/date-utils');
const _ = require('lodash');

/** @private */
const INVALID_YEAR = 'INVALID_YEAR';

/** @private */
const INVALID_MONTH = 'INVALID_MONTH';

/** @private */
const INVALID_DAY = 'INVALID_DAY';

/** @private */
const INVALID_DATE = 'INVALID_DATE';

/** @private */
const DAY_ENTRY = 'day-entry';

/** @private */
const MONTH_ENTRY = 'month-entry';

/** @private */
const YEAR_ENTRY = 'year-entry';

/** @private */
const DATE_FORMAT = 'D/M/Y';

/** @private */
const DATE_INPUT_ELEMENT_ID = 'date-input';

const errorMessages = messages.settings.featureToggles.labels.errors;

const handlers = () => {
  const getError = (field, errorMessage) => {
    if (_.includes([INVALID_YEAR, INVALID_MONTH, INVALID_DAY], errorMessage)) {
      errorMessage = INVALID_DATE;
    }
    const error = {};
    error.field = field;
    error.detailedDescription = errorMessages[errorMessage];
    error.description = errorMessages[errorMessage];
    return error;
  };

  const validate = (data, toggle = 'true') => {
    const errors = [];
    const { day, month, year } = data;

    const basicValidationErrors = dateUtils.basicValidation(
      day, DAY_ENTRY,
      month, MONTH_ENTRY,
      year, YEAR_ENTRY,
      DATE_INPUT_ELEMENT_ID,
      'featureToggles',
      getError,
    );

    if (!_.isEmpty(basicValidationErrors)) {
      // no point continuing if the data has not passed basic validation
      return _.concat(errors, basicValidationErrors);
    }

    // validate the date
    const dateToValidate = `${day}/${month}/${year}`;
    const { date, errors: validationErrors } = dateUtils.validate(
      dateToValidate,
      DAY_ENTRY, MONTH_ENTRY, YEAR_ENTRY,
      DATE_FORMAT,
      'featureToggles',
      getError,
    );

    if (!_.isEmpty(validationErrors)) {
      return _.concat(errors, validationErrors);
    }

    // now ensure that it is not in the future and not before the lower boundary
    const isBeforeTodayError = dateUtils.isBeforeToday(
      date,
      DATE_INPUT_ELEMENT_ID,
      'featureToggles',
      getError,
    );
    if (!_.isEmpty(isBeforeTodayError) && toggle === 'true') {
      errors.push(isBeforeTodayError);
    }
    // adding the date to the data so we can pull it from cache without manipulating day, month etc.
    data.date = date;
    return errors;
  };

  const getViewData = async (request) => {
    const { featureToggleId } = request.params;

    const featureToggle = await featureToggleService.getFeatureToggle(request, featureToggleId);

    return {
      title: `${messages.settings.featureToggles.title} ${featureToggle.name}`,
      labels: messages.settings.featureToggles.labels,
      featureToggle,
      strategy: featureToggle.featureToggleActivationStrategy['@type'],
    };
  };

  const GET = async (request, h) => {
    const data = await getViewData(request);
    if (data.strategy === 'FROM_DATE') {
      [data.year, data.month, data.day] = data.featureToggle.featureToggleActivationStrategy.dateActiveFrom.split('-');
    }
    if (data.strategy === 'BEFORE_DATE') {
      [data.year, data.month, data.day] = data.featureToggle.featureToggleActivationStrategy.dateActiveBefore.split('-');
    }
    return h.view('settings/feature-toggle', data);
  };

  const POST = async (request, h) => {
    const data = await getViewData(request);
    const { featureToggleStatus, featureToggleDescription } = request.payload;
    const { featureToggleId } = request.params;

    let errors;
    if (_.endsWith(data.featureToggle.featureToggleActivationStrategy['@type'], '_DATE')) {
      errors = validate(request.payload, request.payload.featureToggleStatus);
      data.day = request.payload.day;
      data.month = request.payload.month;
      data.year = request.payload.year;
    }
    if (data.featureToggle.featureToggleActivationStrategy['@type'] === 'FROM_DATE') {
      data.featureToggle.featureToggleActivationStrategy.dateActiveFrom =
          `${request.payload.year}-${request.payload.month.padStart(2, '0')}-${request.payload.day.padStart(2, '0')}`;
    }
    if (data.featureToggle.featureToggleActivationStrategy['@type'] === 'BEFORE_DATE') {
      data.featureToggle.featureToggleActivationStrategy.dateActiveBefore =
          `${request.payload.year}-${request.payload.month.padStart(2, '0')}-${request.payload.day.padStart(2, '0')}`;
    }

    const featureToggle = {
      id: featureToggleId,
      name: data.featureToggle.name,
      enabled: featureToggleStatus === 'true',
      description: featureToggleDescription,
      featureToggleActivationStrategy: data.featureToggle.featureToggleActivationStrategy,
    };

    data.featureToggle = featureToggle;

    const errorMessage = messages.settings.featureToggles.labels.error;
    if (!_.isEmpty(errors)) {
      data.errors = errors;
      data.title = `${errorMessage}: ${data.title}`;
      return h.view('settings/feature-toggle', data);
    }

    await featureToggleService.updateFeatureToggle(request, featureToggleId, featureToggle);

    const { title, titleEnd } = messages.settings.featureTogglesSuccess;
    data.title = `${title} ${featureToggle.name} ${titleEnd}`;
    data.labels = messages.settings.featureTogglesSuccess.labels;
    return h.view('settings/feature-toggle-success', data);
  };

  return {
    GET,
    POST,
  };
};

module.exports = {
  handlers,
};
