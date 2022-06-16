const sinon = require('sinon');
const chai = require('chai');
const config = require('../../src/config.js');
const httpClient = require('../../src/services/http-client');
const configurableContentService = require('../../src/services/configurable-content-service');
chai.use(require('sinon-chai'));

const { expect } = chai;

const request = {
  userAccount: {},
  headers: {},
  info: {},
};

const configurableContent = {
  test: 'data',
};

describe('Configurable Content Service', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(httpClient, 'POST');
    sandbox.stub(httpClient, 'GET');
    sandbox.stub(httpClient, 'DELETE');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('updateConfigurableContent', async () => {
    await configurableContentService.updateConfigurableContent(request, configurableContent);

    expect(httpClient.POST).to.have.been.calledWith(request, {
      url: `${config.REACH_API}/configurable-contents`,
      data: configurableContent,
    });
  });

  it('addConfigurableContent', async () => {
    await configurableContentService.addConfigurableContent(request, configurableContent);

    expect(httpClient.POST).to.have.been.calledWith(request, {
      url: `${config.REACH_API}/configurable-contents`,
      data: configurableContent,
    });
  });

  it('getActiveConfigurableContent', async () => {
    const contentType = 'dummy';

    httpClient.GET.withArgs(request, {
      url: `${config.REACH_API}/configurable-contents/${contentType}/active`,
    }).returns(Promise.resolve({
      data: configurableContent,
    }));

    const result = await configurableContentService.getActiveConfigurableContent(request, contentType);

    expect(result).to.eql(configurableContent);
  });

  it('getLatestContents', async () => {
    const contentType = 'dummy';

    httpClient.GET.withArgs(request, {
      url: `${config.REACH_API}/configurable-contents/types/${contentType}`,
    }).returns(Promise.resolve({
      data: configurableContent,
    }));

    const result = await configurableContentService.getLatestContents(request, contentType);

    expect(result).to.eql(configurableContent);
  });

  it('getContent', async () => {
    const contentId = 'content1';

    httpClient.GET.withArgs(request, {
      url: `${config.REACH_API}/configurable-contents/${contentId}`,
    }).returns(Promise.resolve({
      data: configurableContent,
    }));

    const result = await configurableContentService.getContent(request, contentId);

    expect(result).to.eql(configurableContent);
  });

  it('deleteContent', async () => {
    const contentId = 'content1';

    await configurableContentService.deleteContent(request, contentId);

    expect(httpClient.DELETE).to.have.been.calledWith(request, {
      url: `${config.REACH_API}/configurable-contents/${contentId}`,
    });
  });
});
