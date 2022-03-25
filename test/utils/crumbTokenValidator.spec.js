const crumbTokenValidator = require('../../src/utils/crumbTokenValidator');
const { expect } = require('chai');

describe('crumbTokenValidator test suite', () => {
  it('should return no error for valid crumb token pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11Lc', () => {
    const result = crumbTokenValidator.validate('pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11Lc');
    expect(result.error).to.equal(undefined);
  });
  it('should return no error for valid crumb token 76cpZ31rcwgmF_FIbhph0VKUjcTAKZHAJ2z1DJU4Znb', () => {
    const result = crumbTokenValidator.validate('76cpZ31rcwgmF_FIbhph0VKUjcTAKZHAJ2z1DJU4Znb');
    expect(result.error).to.equal(undefined);
  });
  it('should return no error for valid crumb token tybzgto5f2L2IKkQcPoq_00z-w-EWfPP4yDJA-Gfqi5', () => {
    const result = crumbTokenValidator.validate('tybzgto5f2L2IKkQcPoq_00z-w-EWfPP4yDJA-Gfqi5');
    expect(result.error).to.equal(undefined);
  });
  it('should return error for invalid alphanumeric crumb token pt3vmOmE!qxt57fZlSIjyR3Kf81yv7TZ9WCngwH11L@', () => {
    const result = crumbTokenValidator.validate('pt3vmOmE!qxt57fZlSIjyR3Kf81yv7TZ9WCngwH11L@');
    expect(result.error).to.not.equal(undefined);
  });
  it('should return error for invalid max size crumb token pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11Lc2', () => {
    const result = crumbTokenValidator.validate('pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11Lc2');
    expect(result.error).to.not.equal(undefined);
  });
  it('should return error for invalid min size crumb token pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11L', () => {
    const result = crumbTokenValidator.validate('pt3vmOmEaqxt57fZlSIjyR3Kf81yv7TZ9WCngwH11L');
    expect(result.error).to.not.equal(undefined);
  });
  it('should return undefined when there is no cookie', () => {
    const result = crumbTokenValidator.validate(undefined);
    expect(result).to.equal(undefined);
  });
});
