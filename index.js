const { createServer, configureServer } = require('./src/server/server');
const appInsights = require('applicationinsights');
const { AzureApplicationInsightsLogger } = require('winston-azure-application-insights');
const config = require('./src/config.js');

// Configure App Insights
const startTime = Date.now();
const cloudRoleName = 'reach support admin FE';

appInsights.setup(config.appInsightsIkey)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
  .setUseDiskRetryCaching(true);
appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRoleName;
appInsights.start();

const logger = require('./src/logger');

if (config.environment === 'production') {
  logger.add(new AzureApplicationInsightsLogger({
    insights: appInsights,
  }));
}
const configureAndStartServer = async () => {
  const skippedURLs = [];
  const crumbOptions = {
    cookieOptions: {
      isSecure: config.environment === 'production',
    },
    skip: (request, h) => (skippedURLs.includes(request.route.path)),
  };

  const server = createServer(process.env.PORT || 8001);

  await configureServer(server, crumbOptions);

  function start() {
    try {
      server.start();
    } catch (error) {
      console.log(`Error: ${error}`);
      process.exit(1);
    }

    console.log(`\r\nServer running at: ${server.info.uri}`);

    module.exports = server;
  }

  start();

  if (config.environment === 'production') {
    const duration = Date.now() - startTime;
    appInsights.defaultClient
      .trackEvent({ name: cloudRoleName, measurements: { 'server startup time': duration } });
  }
};

try {
  configureAndStartServer();
} catch (error) {
  console.log(`Error: ${error}`);
  process.exit(1);
}
