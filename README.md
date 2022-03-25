# REACH Support admin ui
This application allows for administrators of UK-REACH to support the application. Initially, they will be able to toggle the status of all feature toggles.

It is a node application using hapi. Your npm and node versions should match what is required for reach-ui.

### Environment variables
The following environment variables are required to run `reach-support-admin-ui` locally. You will need additional variables for any dependent services. Some environment variables are used in other UK-REACH services.

```
API

SUPPORT_ADMIN_AAD_CLIENT_ID
SUPPORT_ADMIN_AAD_CLIENT_SECRET
SUPPORT_ADMIN_AAD_TENANT_ID
SUPPORT_ADMIN_AAD_COOKIE_PASSWORD
SUPPORT_ADMIN_AAD_REDIRECT_URI

APPLICATION_INSIGHTS_IKEY
REACH_SUPPORT_ADMIN_COOKIE_SECRET
DEPENDANT_SERVICES

REACH_SUPPORT_ADMIN_REDIS_PREFIX
REDIS_SERVER_NAME
REDIS_SERVER_KEY
```

Optional environment variables
```
CHEMICALS_COOKIE_EXPIRY_TIME
REACH_SUPPORT_ADMIN_LOGGING_FE_LEVEL
JWT_TOKEN_EXP
JWT_ALGORITHM
JWT_SECRET_KEY (*)

NODE_ENV

REDIS_SERVER_PORT
REDIS_TTL
REDIS_CACHE_TTL

(*) Must match secret for AAA
```

### Running and developing locally
`reach-support-admin-ui` has a single dependency on reach-aaa (currently inside chemicals).
A redis server is required for storing information about the logged in user.


You will need to run `npm install` when you first pull the repository.

Start application
```
npm run dev
```

Run unit tests
```
npm run test
```
