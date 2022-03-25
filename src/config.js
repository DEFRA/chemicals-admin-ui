module.exports.REACH_API = process.env.API;
module.exports.cookieExpiryTime = process.env.CHEMICALS_COOKIE_EXPIRY_TIME || '86400000'; // 24 hours i.e 24 * 60 * 60 * 1000
module.exports.cookieName = 'reach-support-admin';
module.exports.reachSupportAdminLoggingFeLevel = process.env.REACH_SUPPORT_ADMIN_LOGGING_FE_LEVEL || 'info';
module.exports.appInsightsIkey = process.env.APPLICATION_INSIGHTS_IKEY;

// JWT
module.exports.jwtTokenExp = process.env.JWT_TOKEN_EXP || '2m';
module.exports.jwtAlgorithm = process.env.JWT_ALGORITHM || 'HS256';
module.exports.jwtSecret = process.env.JWT_SECRET_KEY || 'MySecretKey';

// Azure AD Configuration
module.exports.aadClientID = process.env.SUPPORT_ADMIN_AAD_CLIENT_ID;
module.exports.aadClientSecret = process.env.SUPPORT_ADMIN_AAD_CLIENT_SECRET;
module.exports.aadTenantID = process.env.SUPPORT_ADMIN_AAD_TENANT_ID;
module.exports.aadCookiePassword = process.env.SUPPORT_ADMIN_AAD_COOKIE_PASSWORD;
module.exports.aadRedirectURI = process.env.SUPPORT_ADMIN_AAD_REDIRECT_URI;

module.exports.environment = process.env.NODE_ENV || 'dev';

// REACH cookie
module.exports.reachSupportAdminCookieSecret = process.env.REACH_SUPPORT_ADMIN_COOKIE_SECRET;

// Cache-control policy
module.exports.CACHE_CONTROL_POLICY = 'no-store, no-cache';

// Dependant service URLs
module.exports.DEPENDANT_SERVICES = process.env.DEPENDANT_SERVICES;

// Redis
module.exports.redisPrefix = process.env.REACH_SUPPORT_ADMIN_REDIS_PREFIX;
module.exports.redisServerName = process.env.REDIS_SERVER_NAME;
module.exports.redisServerPort = process.env.REDIS_SERVER_PORT || '6379';// 'redis://localhost:6380 {tls: {ca: caCert}'
module.exports.redisServerKey = process.env.REDIS_SERVER_KEY;
module.exports.redisTimeout = process.env.REDIS_TTL || 1209600; // 2 weeks in seconds
module.exports.redisCacheTimeout = process.env.REDIS_CACHE_TTL || 1209600000; // 2 weeks in milliseconds
