const sessionService = require('../../../services/session-service');

const DOMAIN_INDEX = 1;

/**
 * Stores a list of all valid organisations who will be using the system
 * @returns {Map<string, string>}
 */

const getValidOrganisations = () => {
  const organisations = new Map();
  organisations.set('hse.gov.uk', 'HSE');
  organisations.set('hse.gsi.gov.uk', 'HSE');
  organisations.set('environment-agency.gsi.gov.uk', 'Environment Agency');
  organisations.set('environment-agency.gov.uk', 'Environment Agency');
  organisations.set('defra.gsi.gov.uk', 'DEFRA');
  organisations.set('defra.gov.uk', 'DEFRA');

  return organisations;
};

/**
 * Splits an email address at the @ and return the domain of the email
 * @param emailAddress
 * @returns {*}
 */
const getDomain = (emailAddress) => {
  const emailAddresssParts = emailAddress.split('@');
  return emailAddresssParts[DOMAIN_INDEX];
};

/**
 * Maps an email domain to known organisations who will be using the system
 * @param domain
 * @returns {string}
 */
const getOrganisationFromEmail = (domain) => {
  const organisations = getValidOrganisations();

  if (organisations.has(domain)) {
    return organisations.get(domain);
  }

  return 'Admin User';
};

const setClaims = (request, token) => {
  const claims = {
    userId: token.id, // to provide
    contactId: null,
    legalEntity: null, // deprecate
    legalEntityId: null, // always null for admin user
    legalEntityRole: null, // always null for admin user
    groups: ['b42500c7-80be-4251-a028-d17f4587bb44'],
    source: null,
    role: 'SUPPORT_ADMIN',
    email: token.email,
    activeFeatureToggles: null,
  };

  sessionService.set('claims', claims, request);
};

const getAccountFromRequest = async (request) => {
  const token = request.auth.credentials.profile;

  setClaims(request, token);

  const userDetails = {
    userId: token.id, // to provide
    name: token.displayName,
    organisation: getOrganisationFromEmail(getDomain(token.email)),
    email: token.email,
  };

  sessionService.set('userDetails', userDetails, request);
};

const handlers = () => {
  const LOGIN = async (request, reply) => {
    if (request.auth.isAuthenticated) {
      await getAccountFromRequest(request);

      const sessionId = sessionService.getSessionId(request);
      request.cookieAuth.set({ sessionId });

      return reply.redirect('/homepage');
    }

    return reply.redirect('/auth');
  };

  return {
    LOGIN,
  };
};

module.exports = {
  handlers,
};
