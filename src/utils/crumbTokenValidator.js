const Joi = require('joi');

const crumbSchema = Joi.object().keys({
  crumbToken: Joi.string().pattern(new RegExp('^[a-zA-Z0-9-_]{43}$')).required(),
});

const validate = (token) => {
  if (token === undefined) {
    return undefined;
  }
  return crumbSchema.validate({ crumbToken: token });
};

module.exports = {
  validate,
};
