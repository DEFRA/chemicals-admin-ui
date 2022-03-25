const { OK, INTERNAL_SERVER_ERROR } = require('http-status');

/** @private */
const HEALTHY = 'HEALTHY';

/** @private */
const UNHEALTHY = 'UNHEALTHY';

/**
 * Returns the health of REACH depending on it's dependencies.
 *
 * @param {*} dependencies
 * @returns {{reports: *, health: *}}
 */
async function getHealthcheckReports(dependencies) {
  const reports = [];
  let aggregatedHealth = HEALTHY;

  if (dependencies) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < dependencies.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const dependencyReport = await dependencies[i].getHealthReport();

      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < dependencyReport.length; j++) {
        reports.push(dependencyReport[j]);
        if (dependencyReport[j].status === UNHEALTHY) {
          aggregatedHealth = dependencyReport[j].status;
        }
      }
    }
  }

  return { health: aggregatedHealth, reports };
}

const handlers = () => {
  const GET = async (request, h) => {
    const { healthchecks } = request.server;
    const healthcheckReports = await getHealthcheckReports(healthchecks);

    return h.response({
      version: request.server.app.version,
      health: healthcheckReports.health,
      details: healthcheckReports.reports,
    })
      .code(healthcheckReports.health === HEALTHY ? OK : INTERNAL_SERVER_ERROR);
  };

  return {
    GET,
  };
};

module.exports = {
  handlers,
};
