@Library('jenkins-shared-library')_
def helper = new helpers.NodePipelineHelper(this);

node (label: 'autoSlaveLive') {
  def secrets = [
    [envVariable: 'SUPPORT_ADMIN_AAD_CLIENT_ID', name: 'b2b-AAD-CLIENT-ID', secretType:'Secret'],
    [envVariable: 'SUPPORT_ADMIN_AAD_CLIENT_SECRET', name: 'b2b-AAD-CLIENT-SECRET', secretType:'Secret'],
    [envVariable: 'SUPPORT_ADMIN_AAD_TENANT_ID', name: 'b2b-AAD-TENANT-ID', secretType:'Secret'],
    [envVariable: 'SUPPORT_ADMIN_AAD_COOKIE_PASSWORD', name: 'b2b-AAD-COOKIE-PASSWORD', secretType:'Secret'],
    [envVariable: 'REACH_SUPPORT_ADMIN_COOKIE_SECRET', name: 'reachCookieSecret', secretType:'Secret'],
    [envVariable: 'REDIS_SERVER_KEY', name: 'pmcRedisKey', secretType:'Secret']
    ]

  def APP_NAME = "reach-support-admin-ui"
  def APP_NAME_ENV = "reach-support-admin-ui-${helper.getEnvSuffix()}"
  def ACR_REPOSITORY = "reach-support-admin-ui"
  def SUPPORT_ADMIN_AAD_REDIRECT_URI = "https://reach-support-admin-ui-${helper.getEnvSuffix()}.azurewebsites.net"
  def REDIS_SERVER_NAME = "SNDCHMRDS001.redis.cache.windows.net"
  def REDIS_SERVER_PORT = "6380"
  def REACH_SUPPORT_ADMIN_REDIS_PREFIX = "support-admin-${helper.getEnvSuffix()}"
  def API = "https://reach-develop.azurewebsites.net"
  def DEPENDANT_SERVICES = "REACH,https://reach-develop.azurewebsites.net;"
  def RESOURCE_ID = "SNDCHMINFRGP001-${APP_NAME_ENV}"

  withAzureKeyvault(secrets) {
    def envArray = [
      "APP_NAME=${APP_NAME}",
      "APP_NAME_ENV=${APP_NAME_ENV}",
      "ACR_REPOSITORY=${ACR_REPOSITORY}",
      "RESOURCE_GROUP=${RESOURCE_ID}",
      "CONNECTION_STRING=SUPPORT_ADMIN_AAD_REDIRECT_URI='${SUPPORT_ADMIN_AAD_REDIRECT_URI}' SUPPORT_ADMIN_AAD_CLIENT_ID='${SUPPORT_ADMIN_AAD_CLIENT_ID}' SUPPORT_ADMIN_AAD_CLIENT_SECRET='${SUPPORT_ADMIN_AAD_CLIENT_SECRET}' SUPPORT_ADMIN_AAD_REDIRECT_URI='${SUPPORT_ADMIN_AAD_REDIRECT_URI}' SUPPORT_ADMIN_AAD_REDIRECT_URI='${SUPPORT_ADMIN_AAD_REDIRECT_URI}' SUPPORT_ADMIN_AAD_TENANT_ID='${SUPPORT_ADMIN_AAD_TENANT_ID}' SUPPORT_ADMIN_AAD_COOKIE_PASSWORD='${SUPPORT_ADMIN_AAD_COOKIE_PASSWORD}' REACH_SUPPORT_ADMIN_COOKIE_SECRET='${REACH_SUPPORT_ADMIN_COOKIE_SECRET}' REDIS_SERVER_KEY='${REDIS_SERVER_KEY}' REDIS_SERVER_NAME='${REDIS_SERVER_NAME}' REDIS_SERVER_PORT='${REDIS_SERVER_PORT}' REACH_SUPPORT_ADMIN_REDIS_PREFIX='${REACH_SUPPORT_ADMIN_REDIS_PREFIX}' API='${API}' DEPENDANT_SERVICES='${DEPENDANT_SERVICES}'",
    ]

    withEnv(envArray) {
      reachNodePipeline()
    }
  }
}
