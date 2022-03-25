const config = require('../config.js');
const logger = require('../logger');
const httpClient = require('../services/http-client');

/**
 * Service for running health checks against dependant applications
 *
 * The service will take a environmental variable called DEPENDANT_SERVICES in a specified format (below) and parse out the list of services to run health checks against when the isHealthy method is called
 *
 * DEPENDANT_SERVICES format
 *
 * The environment variable DEPENDANT_SERVICES should be a comma separated value list of 3 values separated by semi-colons (;) per value group;
 *
 * name,url,endpoint;name,url,endpoint;name,url,endpoint
 * e.g "REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,healthcheck/lite"
 *
 * name: Service Name
 * url: Service URL
 * endpoint: Health Check Endpoint (optional, defaults to /healthcheck)
 *
 * Notice the use of the 3rd value, endpoint. This is an optional value that will default to health check if not supplied
 *
 * The health of the service is determined based on the HTTP code of the response, 200 is healthy, all over codes are unhealthy
 */

const SERVICE_IDENTIFIER = 'Dependant health check service';
const DEFAULT_ENDPOINT = '/healthcheck';
const HTTP_CLIENT_REQUEST = { userId: SERVICE_IDENTIFIER, claims: { userId: SERVICE_IDENTIFIER } };

const NAME_IDX = 0;
const URL_IDX = 1;
const ENDPOINT_IDX = 2;

const RECORD_WITH_DEFAULT_ENDPOINT = 2;
const RECORD_WITH_CUSTOM_ENDPOINT = 3;

function createServiceListFromConfig() {
  return config.DEPENDANT_SERVICES.split(';').map((rec) => {
    const splitRecord = rec.split(',');
    let configRecord;

    if (splitRecord.length === RECORD_WITH_DEFAULT_ENDPOINT) {
      configRecord = { name: splitRecord[NAME_IDX].trim(), url: `${splitRecord[URL_IDX].trim()}${DEFAULT_ENDPOINT}` };
      logger.debug(`${SERVICE_IDENTIFIER} - Found config record using default endpoint: ${splitRecord}`);
    } else if (splitRecord.length === RECORD_WITH_CUSTOM_ENDPOINT) {
      if (splitRecord[ENDPOINT_IDX].startsWith('/')) {
        configRecord = {
          name: splitRecord[NAME_IDX].trim(),
          url: `${splitRecord[URL_IDX].trim()}${splitRecord[ENDPOINT_IDX].trim()}`,
        };
      } else {
        configRecord = {
          name: splitRecord[NAME_IDX].trim(),
          url: `${splitRecord[URL_IDX].trim()}/${splitRecord[ENDPOINT_IDX].trim()}`,
        };
      }
      logger.debug(`${SERVICE_IDENTIFIER} - Found config record using custom endpoint: ${splitRecord}`);
    } else {
      configRecord = null;
      logger.debug(`${SERVICE_IDENTIFIER} - Found bad config record: ${splitRecord}`);
    }

    return configRecord;
  }).filter(element => element);
}

class DependantHealthCheckService {
  constructor() {
    if (config.DEPENDANT_SERVICES) {
      this.active = true;
      this.serviceList = createServiceListFromConfig();
      if (Array.isArray(this.serviceList) && this.serviceList.length > 0) {
        this.validConfig = true;
        logger.debug(`${SERVICE_IDENTIFIER} - Service list built: ${this.serviceList}`);
        logger.info(`${SERVICE_IDENTIFIER} - Service started with ${this.serviceList.length} configured services`);
      } else {
        this.validConfig = false;
        logger.error(`${SERVICE_IDENTIFIER} - Bad or no config found for dependant service health checks, config is: ${config.DEPENDANT_SERVICES}`);
      }
    } else {
      this.active = false;
      this.validConfig = false;
      logger.info(`${SERVICE_IDENTIFIER} - No config found for dependant service health checks`);
    }
  }

  async getHealthReport() {
    if (this.validConfig) {
      const healthCheckRequests = [];
      const healthCheckResults = [];

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.serviceList.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        healthCheckRequests.push(httpClient.GET(HTTP_CLIENT_REQUEST, { url: this.serviceList[i].url }));
      }

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.serviceList.length; i++) {
        let resolvedRequest = null;

        try {
          // eslint-disable-next-line no-await-in-loop
          resolvedRequest = await Promise.resolve(healthCheckRequests[i]);
        } catch (error) {
          resolvedRequest = { response: { response: { status: 500 } } };
          logger.error(`${SERVICE_IDENTIFIER} - Error calling health check for ${this.serviceList[i].name}, error is "${error.message}"`);
        }

        healthCheckResults.push({ name: `${this.serviceList[i].name}`, response: resolvedRequest });
      }
      return healthCheckResults.map(element => ({ name: element.name, status: element.response.status === 200 ? 'HEALTHY' : 'UNHEALTHY' }));
    }
    return [];
  }
}

module.exports = DependantHealthCheckService;
