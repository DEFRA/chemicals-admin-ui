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
  const reports = (await Promise.all((dependencies || []).map(dep => dep.getHealthReport()))).flat();
  return {
    reports,
    health: reports.some(report => report.status === UNHEALTHY) ? UNHEALTHY : HEALTHY,
  };
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
