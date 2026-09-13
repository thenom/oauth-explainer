import { AUTH_CODE_PKCE_FLOW } from './authCodePkce.js';
import { AUTH_CODE_SECRET_FLOW } from './authCodeSecret.js';
import { CLIENT_CREDENTIALS_FLOW } from './clientCredentials.js';
import { REFRESH_TOKEN_FLOW } from './refreshToken.js';
import { DEVICE_FLOW } from './deviceFlow.js';
import { IMPLICIT_FLOW } from './implicitFlow.js';

export const ALL_FLOWS = [
  AUTH_CODE_PKCE_FLOW,
  AUTH_CODE_SECRET_FLOW,
  CLIENT_CREDENTIALS_FLOW,
  REFRESH_TOKEN_FLOW,
  DEVICE_FLOW,
  IMPLICIT_FLOW
];

export const FLOWS_MAP = {
  auth_code_pkce: AUTH_CODE_PKCE_FLOW,
  auth_code_secret: AUTH_CODE_SECRET_FLOW,
  client_credentials: CLIENT_CREDENTIALS_FLOW,
  refresh_token: REFRESH_TOKEN_FLOW,
  device_flow: DEVICE_FLOW,
  implicit_flow: IMPLICIT_FLOW
};

export const PROVIDER_PRESETS = [
  {
    id: 'generic',
    name: 'Standard OAuth 2.0 / OIDC',
    authUrl: 'https://auth.provider.com/oauth/v2/authorize',
    tokenUrl: 'https://auth.provider.com/oauth/v2/token',
    apiUrl: 'https://api.provider.com/v1',
    defaultScope: 'openid profile email read:photos',
    clientId: 'my-web-app-client-id-74892'
  },
  {
    id: 'google',
    name: 'Google Identity (OpenID Connect)',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    defaultScope: 'openid email profile https://www.googleapis.com/auth/drive.readonly',
    clientId: '8492019482-example.apps.googleusercontent.com'
  },
  {
    id: 'github',
    name: 'GitHub OAuth Apps',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com/user',
    defaultScope: 'read:user user:email repo',
    clientId: 'Ov23li49182390192a'
  },
  {
    id: 'auth0',
    name: 'Auth0 / Okta Customer Identity',
    authUrl: 'https://dev-tenant.us.auth0.com/authorize',
    tokenUrl: 'https://dev-tenant.us.auth0.com/oauth/token',
    apiUrl: 'https://dev-tenant.us.auth0.com/userinfo',
    defaultScope: 'openid profile email offline_access',
    clientId: 'K9x2LpQ812048asldj2'
  }
];
