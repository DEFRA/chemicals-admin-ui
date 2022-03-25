const { expect } = require('chai');
const { getNetworkOrigin, generateHeaders } = require('../../src/services/service-layer');

describe('Service layer test suite', () => {
  it('should return a users IP address from forwarded for header', async () => {
    const request = {
      headers: {
        'x-forwarded-for': '1.2.3.4:56789, 5.6.7.8, 10.11.12.13',
      },
      info: {
        remoteAddress: '127.0.0.1',
      },
    };

    const result = getNetworkOrigin(request);

    expect(result).to.equal('1.2.3.4:56789, 5.6.7.8, 10.11.12.13');
  });

  it('should return a users IP address from remote address', async () => {
    const request = {
      headers: {},
      info: {
        remoteAddress: '127.0.0.1',
      },
    };

    const result = getNetworkOrigin(request);

    expect(result).to.equal('127.0.0.1');
  });

  it('should generate headers for a backend request from forwarded for header', async () => {
    const request = {
      headers: {
        'x-forwarded-for': '1.2.3.4:56789, 5.6.7.8, 10.11.12.13',
      },
      info: {
        remoteAddress: '127.0.0.1',
      },
      userAccount: {
        user: 'industry1@email.com',
        legalEntity: 'Richmond Chemicals',
        displayName: 'industry1@email.com',
        role: 'INDUSTRY_USER',
      },
      claims: {
        userId: 'fake-user-id',
      },
    };

    const result = generateHeaders(request);

    expect(result.headers).to.have.all.keys(
      'Authorization',
      'x-forwarded-for',
      'x-remote-user',
    );
    expect(result.headers['x-forwarded-for']).to.equal('1.2.3.4:56789, 5.6.7.8, 10.11.12.13');
    expect(result.headers['x-remote-user']).to.equal('fake-user-id');
    expect(result.headers.Authorization).to.match(/^Bearer /);
  });
});
