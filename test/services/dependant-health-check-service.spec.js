const sinon = require('sinon');
const nock = require('nock');
const config = require('../../src/config');
const DependantHealthCheckService = require('../../src/services/dependant-health-check-service');
const { assert } = require('chai');

describe('When performing dependant health checks with good config', () => {
  let sandbox;
  let serviceUrl;
  let aaaUrl;
  let fileUrl;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,healthcheck/lite');
    serviceUrl = nock('https://reach-service.gov.uk');
    aaaUrl = nock('https://reach-aaa-gov.uk');
    fileUrl = nock('https://reach-file.gov.uk');
  });

  it('can build a valid service array', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,healthcheck/lite');
    const service = new DependantHealthCheckService();
    assert((service.active && service.validConfig), 'Service was not able to build a service registry');
  });

  it('can perform health checks', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,healthcheck/lite');

    serviceUrl.get('/healthcheck').reply(200, 'ok');
    aaaUrl.get('/healthcheck').reply(200, 'ok');
    fileUrl.get('/healthcheck/lite').reply(200, 'ok');

    const service = new DependantHealthCheckService();
    const healthReport = await service.getHealthReport();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < healthReport.length; i++) {
      assert(healthReport[i].status === 'HEALTHY', 'Unexpected health check response');
    }

    assert((serviceUrl.isDone() && aaaUrl.isDone() && fileUrl.isDone()), 'Expected services not called');
  });

  it('can handle all good config options', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,/healthcheck/lite');

    serviceUrl.get('/healthcheck').reply(200, 'ok');
    aaaUrl.get('/healthcheck').reply(200, 'ok');
    fileUrl.get('/healthcheck/lite').reply(200, 'ok');

    const service = new DependantHealthCheckService();
    const healthReport = await service.getHealthReport();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < healthReport.length; i++) {
      assert(healthReport[i].status === 'HEALTHY', 'Unexpected health check response');
    }

    assert((serviceUrl.isDone() && aaaUrl.isDone() && fileUrl.isDone()), 'Expected services not called');
  });

  it('can handle bad config options', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service');

    const service = new DependantHealthCheckService();
    const healthReport = await service.getHealthReport();

    assert(!healthReport.validConfig);
    const badReport = await service.getHealthReport();
    assert(badReport.length === 0);
  });

  it('can handle good and bad config options', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service;REACH AAA,https://reach-aaa-gov.uk');
    aaaUrl.get('/healthcheck').reply(200, 'ok');

    const service = new DependantHealthCheckService();

    assert(service.validConfig);
    const report = await service.getHealthReport();
    assert(report.length === 1);
    assert(report[0].name = 'REACH AAA');
  });

  it('can handle exceptions', async () => {
    sandbox.stub(config, 'DEPENDANT_SERVICES').value('REACH Service,https://reach-service.gov.uk,healthcheck;REACH AAA,https://reach-aaa-gov.uk;REACH File,https://reach-file.gov.uk,/healthcheck/lite');

    // This causes a nock error for some reason which has the desired affect
    serviceUrl.get('/healthcheck').reply(500, 'ok');
    aaaUrl.get('/healthcheck').reply(200, 'ok');
    fileUrl.get('/healthcheck/lite').reply(200, 'ok');

    const service = new DependantHealthCheckService();
    const healthReport = await service.getHealthReport();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < healthReport.length; i++) {
      if (healthReport[i].name === 'REACH Service') {
        assert(healthReport[i].status === 'UNHEALTHY', 'Unexpected health check response');
      } else {
        assert(healthReport[i].status === 'HEALTHY', 'Unexpected health check response');
      }
    }

    assert((serviceUrl.isDone() && aaaUrl.isDone() && fileUrl.isDone()), 'Expected services not called');
  });
});
