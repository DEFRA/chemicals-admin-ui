const dateUtils = require('../../src/helpers/date-utils');
const moment = require('moment');
const messages = require('../../src/messages');
const { expect } = require('chai');

describe('date-utils test suite', () => {
  const errorMessages = messages.settings.featureToggles.labels.errors;
  const assertErrorMessage = (error, expectedMessage) => {
    expect(error).to.not.equal(null);
    expect(error.description).to.equal(errorMessages.SUMMARY);
    expect(error.detailedDescription).to.equal(expectedMessage);
  };

  it('should return error when checking if yesterday is before today', () => {
    const yesterday = moment.utc().subtract(1, 'days');
    const error = dateUtils.isBeforeToday(yesterday, '', 'featureToggles');
    assertErrorMessage(error, errorMessages.DATE_IN_PAST);
  });

  it('should not return error when checking if today is before today', () => {
    const today = moment.utc();
    const error = dateUtils.isBeforeToday(today, '');
    expect(error).to.equal(null);
  });

  it('should not return error when checking if tomorrow is before today', () => {
    const tomorrow = moment.utc().add(1, 'days');
    const error = dateUtils.isBeforeToday(tomorrow, '');
    expect(error).to.equal(null);
  });

  it('should return error for missing day', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      '', '',
      today.month().toString(), '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.MISSING_DATE);
  });

  it('should return error for missing month', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      '', '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.MISSING_DATE);
  });

  it('should return error for missing year', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      today.month().toString(), '',
      '', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.MISSING_DATE);
  });

  it('should return error for invalid length date', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      '111', '',
      today.month().toString(), '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid length month', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      '111', '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid length year', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      today.month().toString(), '',
      '11111', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid length date passing objects', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      { today }, '',
      today.month().toString(), '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid length month passing objects', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      { today }, '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid min length year passing objects', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      today.month().toString(), '',
      '08', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid max length year passing objects', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      today.month().toString(), '',
      '20133', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for invalid length month passing string literal month', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      'June', '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should not return error for basic validation', () => {
    const today = moment.utc();
    const errors = dateUtils.basicValidation(
      today.date().toString(), '',
      today.month().toString(), '',
      today.year().toString(), '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(0);
  });

  it('should return correct error message for invalid date - malformed day', () => {
    const invalidDate = '32/12/2018';
    const { errors } = dateUtils.validate(invalidDate, '', '', '', 'D/M/Y', 'featureToggles');
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return correct error message for invalid date - malformed month', () => {
    const invalidDate = '31/13/2018';
    const { errors } = dateUtils.validate(invalidDate, '', '', '', 'D/M/Y', 'featureToggles');
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return correct error message for invalid date - malformed year', () => {
    const invalidDate = '25/12/11111111111';
    const { errors } = dateUtils.validate(invalidDate, '', '', '', 'D/M/Y', 'featureToggles');
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return invalid date', () => {
    const error = dateUtils.isBeforeToday('invalid', '', 'featureToggles');
    assertErrorMessage(error, errorMessages.INVALID_DATE);
  });

  it('should not return error for valid date', () => {
    const { errors } = dateUtils.validate(moment.utc());
    expect(errors).to.be.empty;
  });

  it('should return error for non-integer being passed as day', () => {
    const errors = dateUtils.basicValidation(
      '1.', '',
      '12', '',
      '2018', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for non-integer being passed as month', () => {
    const errors = dateUtils.basicValidation(
      '25', '',
      '12.', '',
      '2018', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should return error for non-integer being passed as year', () => {
    const errors = dateUtils.basicValidation(
      '25', '',
      '12', '',
      '2018.', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should not return error for leading zero dates', () => {
    const errors = dateUtils.basicValidation(
      '01', '',
      '01', '',
      '2020.', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });

  it('should not return errors for single digit dates', () => {
    const errors = dateUtils.basicValidation(
      '1', '',
      '1', '',
      '2020.', '',
      '',
      'featureToggles',
    );
    expect(errors.length).to.equal(1);
    assertErrorMessage(errors[0], errorMessages.INVALID_DATE);
  });
});

