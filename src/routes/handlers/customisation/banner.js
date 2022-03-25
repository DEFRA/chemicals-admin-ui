const configurableContentService = require('../../../services/configurable-content-service');
const dateUtils = require('../../../helpers/date-utils');
const moment = require('moment-timezone');
const _ = require('lodash');
const messages = require('../../../messages');

const errorMessages = messages.banner.errors;
const INVALID_YEAR = 'INVALID_YEAR';
const INVALID_MONTH = 'INVALID_MONTH';
const INVALID_DAY = 'INVALID_DAY';
const INVALID_DATE = 'INVALID_DATE';
const DAY_ENTRY = 'day-entry';
const MONTH_ENTRY = 'month-entry';
const YEAR_ENTRY = 'year-entry';
const DATE_FORMAT = 'D/M/Y';
const DATE_INPUT_ELEMENT_ID = 'date-input';

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

const validate = (payload) => {
  const errors = [];
  const { day, month, year } = payload;

  const basicValidationErrors = dateUtils.basicValidation(
    day, DAY_ENTRY,
    month, MONTH_ENTRY,
    year, YEAR_ENTRY,
    DATE_INPUT_ELEMENT_ID,
    'banner',
    getError,
  );

  if (!payload.bannerContent) {
    errors.push({
      description: messages.banner.errors.enterBannerContent,
      detailedDescription: messages.banner.errors.enterBannerContent,
      field: 'banner-content',
    });
  }

  if (!_.isEmpty(basicValidationErrors)) {
    // no point continuing if the data has not passed basic validation
    return _.concat(basicValidationErrors, errors);
  }

  // validate the date
  const dateToValidate = `${day}/${month}/${year}`;
  const { date, errors: validationErrors } = dateUtils.validate(
    dateToValidate,
    DAY_ENTRY, MONTH_ENTRY, YEAR_ENTRY,
    DATE_FORMAT,
    'banner',
    getError,
  );

  if (!_.isEmpty(validationErrors)) {
    return _.concat(errors, validationErrors);
  }

  // now ensure that it is not in the future and not before the lower boundary
  const isBeforeTodayError = dateUtils.isNotAfterToday(
    date,
    DATE_INPUT_ELEMENT_ID,
    'banner',
  );

  if (!_.isEmpty(isBeforeTodayError)) {
    errors.push(isBeforeTodayError);
  }

  return errors;
};

const handlers = () => {
  /**
   * View page able to create a banner
   * @param request
   * @param h
   * @returns {Promise<*>}
   * @constructor
   */
  const CREATE_GET = async (request, h) => h.view('customisation/create-banner', {
    title: messages.banner.createBanner.title,
    labels: { ...messages.banner.createBanner, ...messages.banner.common },
  });

  /**
   * Create a banner
   * @param request
   * @param h
   * @returns {Promise<*>}
   * @constructor
   */
  const CREATE_POST = async (request, h) => {
    const {
      bannerContent,
      year,
      month,
      day,
    } = request.payload;

    const errors = validate(request.payload);

    if (!_.isEmpty(errors)) {
      return h.view('customisation/create-banner', {
        errors,
        title: `${messages.banner.common.error}: ${messages.banner.createBanner.title}`,
        labels: { ...messages.banner.createBanner, ...messages.banner.common, ...messages.general.labels },
        bannerContent,
        year,
        month,
        day,
      });
    }

    const validFrom = moment.tz(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000`, 'Europe/London').utc().format();

    try {
      const configurableContent = {
        contentType: 'BANNER',
        contentState: 'APPROVED',
        contentComponents: JSON.parse(bannerContent),
        validFrom,
      };

      await configurableContentService.addConfigurableContent(request, configurableContent);
    } catch (e) {
      errors.push({
        description: messages.banner.errors.ensureCorrectFormat,
        field: 'banner-content',
      });

      return h.view('customisation/create-banner', {
        errors,
        bannerContent,
        year,
        month,
        day,
        title: `${messages.banner.common.error}: ${messages.banner.createBanner.title}`,
        labels: { ...messages.banner.createBanner, ...messages.banner.common, ...messages.general.labels },
      });
    }

    return h.view('customisation/banner-created', {
      title: messages.banner.bannerCreated.title,
      labels: { ...messages.banner.bannerCreated, ...messages.banner.common },
      validFrom,
    });
  };

  /**
   * View a scheduled banner
   * @param request
   * @param h
   * @returns {Promise<*>}
   * @constructor
   */
  const SCHEDULED = async (request, h) => {
    const { configurableContentId } = request.params;
    const banner = await configurableContentService.getContent(request, configurableContentId);

    return h.view('customisation/scheduled-banner', {
      title: `${messages.banner.scheduledBanner.title}`,
      labels: { ...messages.banner.scheduledBanner, ...messages.banner.common },
      banner,
      bannerContentComponents: JSON.stringify(banner.contentComponents, null, 4),
    });
  };

  /**
   * Delete scheduled banner
   * @param request
   * @param h
   * @returns {Promise<*>}
   * @constructor
   */
  const DELETE = async (request, h) => {
    const { configurableContentId } = request.params;

    const banner = await configurableContentService.getContent(request, configurableContentId);

    try {
      await configurableContentService.deleteContent(request, configurableContentId);
    } catch (e) {
      const errors = [];
      errors.push({
        description: messages.banner.errors.unexpectedError,
        field: '',
      });

      return h.view('customisation/scheduled-banner', {
        errors,
        title: `${messages.banner.common.error}: ${messages.banner.scheduledBanner.title}`,
        labels: { ...messages.banner.scheduledBanner, ...messages.banner.common, ...messages.general.labels },
        banner,
        bannerContentComponents: JSON.stringify(banner.contentComponents, null, 4),
      });
    }

    return h.view('customisation/deleted-banner', {
      title: `${messages.banner.deletedBanner.title}`,
      labels: { ...messages.banner.deletedBanner, ...messages.banner.common },
      banner,
      bannerContentComponents: JSON.stringify(banner.contentComponents, null, 4),
    });
  };

  /**
   * View the currently live banner
   * @param request
   * @param h
   * @returns {Promise<*>}
   * @constructor
   */
  const LIVE_GET = async (request, h) => {
    const banner = await configurableContentService.getActiveConfigurableContent(request, 'BANNER');

    return h.view('customisation/live-banner', {
      title: messages.banner.currentlyLive.title,
      labels: { ...messages.banner.currentlyLive, ...messages.banner.common },
      banner,
      bannerContentComponents: JSON.stringify(banner.contentComponents, null, 4),
    });
  };

  const LIVE_POST = async (request, h) => {
    const { bannerContent } = request.payload;

    const validFromNowDate = moment.tz(new Date().toISOString(), 'Europe/London').utc().format();

    try {
      const configurableContent = {
        contentType: 'BANNER',
        contentState: 'APPROVED',
        contentComponents: JSON.parse(bannerContent),
        validFrom: validFromNowDate,
      };

      await configurableContentService.updateConfigurableContent(request, configurableContent);
    } catch (e) {
      const banner = await configurableContentService.getActiveConfigurableContent(request, 'BANNER');

      const errors = [{
        description: messages.banner.errors.unableToParse,
        field: 'banner-content',
      }];

      return h.view('customisation/live-banner', {
        title: `${messages.banner.common.error}: ${messages.banner.currentlyLive.title}`,
        labels: { ...messages.banner.currentlyLive, ...messages.banner.common, ...messages.general.labels },
        banner,
        errors,
        bannerContentComponents: bannerContent,
      });
    }

    return h.view('customisation/banner-saved', {
      title: messages.banner.bannerSaved.title,
      labels: { ...messages.banner.bannerSaved, ...messages.banner.common },
    });
  };

  return {
    CREATE_GET,
    CREATE_POST,
    SCHEDULED,
    DELETE,
    LIVE_GET,
    LIVE_POST,
  };
};

module.exports = {
  handlers,
};
