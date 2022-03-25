const jwt = require('jsonwebtoken');
const config = require('../config');

const bearer = 'Bearer ';

const createToken = (userDetails) => {
  if (!userDetails) {
    return undefined;
  }
  return jwt.sign({
    ...userDetails,
  }, config.jwtSecret, {
    algorithm: config.jwtAlgorithm,
    expiresIn: config.jwtTokenExp,
  });
};

const getAuthHeader = token => ({ Authorization: bearer + token });

module.exports = {
  createToken,
  getAuthHeader,
};
