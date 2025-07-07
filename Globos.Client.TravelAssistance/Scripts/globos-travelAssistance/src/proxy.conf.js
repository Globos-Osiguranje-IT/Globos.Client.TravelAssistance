const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:44353';

const PROXY_CONFIG = [
  {
    context: [
      "/travel/*",
      "/home/*",
      "/signin-oidc",
      "/signin-oidc/*",
      "/auth/*",
      "/auth"
  ],
    target: target,
    secure: false,
    headers: {
      Connection: 'Keep-Alive',
      Accept: "application/json"
    }
  }
]

module.exports = PROXY_CONFIG;
