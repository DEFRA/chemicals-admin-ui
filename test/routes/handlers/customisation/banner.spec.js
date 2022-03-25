const { expect } = require('chai');
const sinon = require('sinon');
const bannerHandler = require('../../../../src/routes/handlers/customisation/banner');
const configurableContentService = require('../../../../src/services/configurable-content-service');
const messages = require('../../../../src/messages');
const moment = require('moment-timezone');

const labels = messages.banner;
const generalLabels = messages.general;

describe('Banner handler', () => {
  let sandbox;
  let h;
  let content;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    h = {
      view: sandbox.spy(),
      redirect: sandbox.stub(),
    };

    content = {
      list: [
        {
          type: 'BannerHeadings',
          heading: 'Important deadlines',
        },
        {
          type: 'BannerDateStatement',
          date: '30 Apr 2021',
          statement: 'Period ends for grandfathering your EU registrations into the UK',
        },
        {
          type: 'BannerDateStatement',
          date: '27 Oct 2021',
          statement: 'Period ends for submitting your downstream user import notification (DUIN)',
        },
        {
          type: 'BannerDateStatement',
          date: '30 Apr 2021',
          statement: 'Period test ends for grandfathering your EU registrations into the UK',
        },
      ],
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render banner page CREATE GET', async () => {
    await bannerHandler.handlers().CREATE_GET({}, h);

    expect(h.view.calledWith('customisation/create-banner', {
      title: labels.createBanner.title,
      labels: { ...labels.createBanner, ...labels.common },
    })).to.be.true;
  });

  it('should render banner page CREATE POST', async () => {
    const year = '2025';
    const month = '12';
    const day = '12';

    const validFrom = moment.tz(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000`, 'Europe/London').utc().format();

    const request = {
      payload: {
        bannerContent: JSON.stringify(content),
        day,
        month,
        year,
      },
    };

    const addConfigurableContentStub = sandbox.stub(configurableContentService, 'addConfigurableContent');

    await bannerHandler.handlers().CREATE_POST(request, h);

    expect(addConfigurableContentStub.calledOnce).to.be.true;

    expect(addConfigurableContentStub.getCall(0).args[0]).to.equal(request);
    expect(addConfigurableContentStub.getCall(0).args[1]).to.eql({
      contentType: 'BANNER',
      contentState: 'APPROVED',
      contentComponents: content,
      validFrom,
    });

    expect(h.view.calledWith('customisation/banner-created', {
      title: labels.bannerCreated.title,
      labels: { ...labels.bannerCreated, ...labels.common },
      validFrom,
    })).to.be.true;
  });

  it('should render banner page CREATE POST - error correct format', async () => {
    const year = '2025';
    const month = '12';
    const day = '12';

    const request = {
      payload: {
        bannerContent: JSON.stringify(content),
        day,
        month,
        year,
      },
    };

    const errors = [{
      description: labels.errors.ensureCorrectFormat,
      field: 'banner-content',
    }];

    const addConfigurableContentStub = sandbox.stub(configurableContentService, 'addConfigurableContent').throws();

    await bannerHandler.handlers().CREATE_POST(request, h);

    expect(addConfigurableContentStub.calledOnce).to.be.true;

    expect(h.view.calledWith('customisation/create-banner', {
      errors,
      bannerContent: JSON.stringify(content),
      year,
      month,
      day,
      title: `${labels.common.error}: ${labels.createBanner.title}`,
      labels: { ...labels.createBanner, ...labels.common, ...generalLabels.labels },
    })).to.be.true;
  });

  it('should render banner page CREATE POST - validation failed', async () => {
    const year = '2010';
    const month = '12';
    const day = '12';

    const request = {
      payload: {
        bannerContent: JSON.stringify(content),
        day,
        month,
        year,
      },
    };

    const errors = [{
      field: 'date-input',
      detailedDescription: 'Banner start date must be in the future',
      description: 'Enter a valid banner start date',
    }];

    await bannerHandler.handlers().CREATE_POST(request, h);

    expect(h.view.calledWith('customisation/create-banner', {
      errors,
      title: `${labels.common.error}: ${labels.createBanner.title}`,
      labels: { ...labels.createBanner, ...labels.common, ...generalLabels.labels },
      bannerContent: JSON.stringify(content),
      year,
      month,
      day,
    })).to.be.true;
  });

  it('should render banner page SCHEDULED', async () => {
    const request = {
      params: {
        configuableContentId: 'ff9ce426-0034-4d5c-a2b6-f27a82be9dc3',
      },
    };

    const configuableContent = {
      contentComponents: {
        test: 'test',
      },
    };

    const getContentStub = sandbox.stub(configurableContentService, 'getContent').returns(configuableContent);

    await bannerHandler.handlers().SCHEDULED(request, h);

    expect(getContentStub.calledOnce).to.be.true;

    expect(h.view.calledWith('customisation/scheduled-banner', {
      title: labels.scheduledBanner.title,
      labels: { ...labels.scheduledBanner, ...labels.common },
      banner: configuableContent,
      bannerContentComponents: JSON.stringify(configuableContent.contentComponents, null, 4),
    })).to.be.true;
  });

  it('should render banner page LIVE GET', async () => {
    const configuableContent = {
      contentComponents: {
        test: 'test',
      },
    };

    const getActiveConfigurableContentStub = sandbox.stub(configurableContentService, 'getActiveConfigurableContent').returns(configuableContent);

    await bannerHandler.handlers().LIVE_GET({}, h);

    expect(getActiveConfigurableContentStub.calledOnce).to.be.true;

    expect(h.view.calledWith('customisation/live-banner', {
      title: labels.currentlyLive.title,
      labels: { ...labels.currentlyLive, ...labels.common },
      banner: configuableContent,
      bannerContentComponents: JSON.stringify(configuableContent.contentComponents, null, 4),
    })).to.be.true;
  });

  it('should render banner page LIVE POST', async () => {
    const request = {
      payload: {
        bannerContent: JSON.stringify(content),
      },
    };

    const updateConfigurableContentStub = sandbox.stub(configurableContentService, 'updateConfigurableContent');

    await bannerHandler.handlers().LIVE_POST(request, h);

    expect(updateConfigurableContentStub.calledOnce).to.be.true;

    expect(updateConfigurableContentStub.getCall(0).args[0]).to.equal(request);
    expect(updateConfigurableContentStub.getCall(0).args[1]).to.eql({
      contentType: 'BANNER',
      contentState: 'APPROVED',
      contentComponents: content,
      validFrom: moment.tz(new Date().toISOString(), 'Europe/London').utc().format(),
    });

    expect(h.view.calledWith('customisation/banner-saved', {
      title: labels.bannerSaved.title,
      labels: { ...labels.bannerSaved, ...labels.common },
    })).to.be.true;
  });

  it('should render banner page LIVE POST - error', async () => {
    const request = {
      payload: {
        bannerContent: JSON.stringify(content),
      },
    };

    const configurableContent = {
      contentComponents: content,
    };

    const errors = [{
      description: labels.errors.unableToParse,
      field: 'banner-content',
    }];

    const updateConfigurableContentStub = sandbox.stub(configurableContentService, 'updateConfigurableContent').throws();
    const getActiveConfigurableContentStub = sandbox.stub(configurableContentService, 'getActiveConfigurableContent').returns(configurableContent);

    await bannerHandler.handlers().LIVE_POST(request, h);

    expect(updateConfigurableContentStub.calledOnce).to.be.true;
    expect(getActiveConfigurableContentStub.calledOnce).to.be.true;

    expect(h.view.calledWith('customisation/live-banner', {
      title: `${labels.common.error}: ${labels.currentlyLive.title}`,
      labels: { ...labels.currentlyLive, ...labels.common, ...generalLabels.labels },
      banner: configurableContent,
      errors,
      bannerContentComponents: JSON.stringify(content),
    })).to.be.true;
  });

  it('should render banner page DELETE', async () => {
    const request = {
      params: {
        configurableContentId: '9ab28deb-641e-4df0-b22c-d3ad62f396ad',
      },
    };

    const configurableContent = {
      contentComponents: content,
    };

    const getContentStub = sandbox.stub(configurableContentService, 'getContent').returns(configurableContent);
    const deleteContentStub = sandbox.stub(configurableContentService, 'deleteContent');

    await bannerHandler.handlers().DELETE(request, h);

    expect(getContentStub.calledOnce).to.be.true;
    expect(deleteContentStub.calledOnce).to.be.true;

    expect(deleteContentStub.getCall(0).args[0]).to.equal(request);
    expect(deleteContentStub.getCall(0).args[1]).to.eql('9ab28deb-641e-4df0-b22c-d3ad62f396ad');

    expect(h.view.calledWith('customisation/deleted-banner', {
      title: labels.deletedBanner.title,
      labels: { ...labels.deletedBanner, ...labels.common },
      banner: configurableContent,
      bannerContentComponents: JSON.stringify(content, null, 4),
    })).to.be.true;
  });

  it('should render banner page DELETE - error', async () => {
    const request = {
      params: {
        configurableContentId: '9ab28deb-641e-4df0-b22c-d3ad62f396ad',
      },
    };

    const configurableContent = {
      contentComponents: content,
    };

    const errors = [{
      description: labels.errors.unexpectedError,
      field: '',
    }];

    const getContentStub = sandbox.stub(configurableContentService, 'getContent').returns(configurableContent);
    const deleteContentStub = sandbox.stub(configurableContentService, 'deleteContent').throws();

    await bannerHandler.handlers().DELETE(request, h);

    expect(getContentStub.calledOnce).to.be.true;
    expect(deleteContentStub.calledOnce).to.be.true;

    expect(h.view.calledWith('customisation/scheduled-banner', {
      errors,
      title: `${labels.common.error}: ${labels.scheduledBanner.title}`,
      labels: { ...labels.scheduledBanner, ...labels.common, ...generalLabels.labels },
      banner: configurableContent,
      bannerContentComponents: JSON.stringify(content, null, 4),
    })).to.be.true;
  });
});
