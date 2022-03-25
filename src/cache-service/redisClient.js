const assert = require('assert');
const bluebird = require('bluebird');
const config = require('../config');
const redis = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const prefix = config.redisPrefix ? `${config.redisPrefix}_` : '';

const environmentCheck = () => {
  assert(config.redisServerPort, 'Missing redis server port');

  if (config.environment !== 'dev') {
    assert(config.redisServerName, 'Missing redis server name');
    assert(config.redisServerKey, 'Missing redis server key');
  }
};

const options = {
  prefix,
  retry_strategy: _ => 5 * 1000, // retry after 5 seconds
  socket_keepalive: true,
};

const createRedisClient = () => {
  environmentCheck();

  if (config.environment === 'dev') {
    // init connection to local Redis instance
    return redis.createClient({
      port: config.redisServerPort,
      ...options,
    });
  }

  // init connection to remote Redis instance with TLS
  return redis.createClient(
    config.redisServerPort,
    config.redisServerName, {
      auth_pass: config.redisServerKey,
      tls: {
        servername: config.redisServerName,
      },
      ...options,
    },
  );
};

class Cache {
  constructor() {
    this.cacheClient = createRedisClient();
  }

  async get(key) {
    this.cacheClient.expireAsync(key, config.redisTimeout);
    return this.cacheClient.getAsync(key);
  }

  async set(key, value) {
    return this.cacheClient.setexAsync(key, config.redisTimeout, value);
  }

  async remove(key) {
    return this.cacheClient.del(key);
  }

  getHealthReport() {
    return [{ name: 'Redis', status: this.isHealthy() ? 'HEALTHY' : 'UNHEALTHY' }];
  }

  isHealthy() {
    return [this.cacheClient.ping()];
  }
}

module.exports = new Cache();
