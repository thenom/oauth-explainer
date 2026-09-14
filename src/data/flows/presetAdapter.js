import { PROVIDER_PRESETS } from './index.js';

export function getProviderPreset(presetId) {
  return PROVIDER_PRESETS.find(p => p.id === presetId) || PROVIDER_PRESETS[0];
}

export function adaptStepForPreset(step, presetId) {
  if (!step || !presetId || presetId === 'generic') {
    return step;
  }

  const preset = getProviderPreset(presetId);
  const genericPreset = PROVIDER_PRESETS[0];

  // Deep clone the step to avoid modifying original definitions
  const adapted = JSON.parse(JSON.stringify(step));

  // Determine provider hostname
  let authHost = 'auth.provider.com';
  let apiHost = 'api.provider.com';
  try {
    authHost = new URL(preset.authUrl).host;
    apiHost = new URL(preset.apiUrl).host;
  } catch {
    // fallback
  }

  // 1. Adapt HTTP Request
  if (adapted.httpRequest) {
    let url = adapted.httpRequest.url;
    url = url.replace('https://auth.provider.com/oauth/v2/authorize', preset.authUrl);
    url = url.replace('https://auth.provider.com/oauth/v2/token', preset.tokenUrl);
    url = url.replace('https://auth.provider.com/oauth/v2/device/code', `${preset.authUrl.replace('/authorize', '')}/device/code`);
    url = url.replace('https://api.provider.com/v1/userinfo', preset.apiUrl);
    url = url.replace('https://api.provider.com/v1/photos/recent', `${preset.apiUrl}/user`);
    url = url.replace('https://api.provider.com/v1/reports/daily', `${preset.apiUrl}/reports`);
    url = url.replace(genericPreset.clientId, preset.clientId);
    
    // Replace scope in query
    const encodedGenericScope = encodeURIComponent(genericPreset.defaultScope).replace(/%20/g, '+');
    const encodedPresetScope = encodeURIComponent(preset.defaultScope).replace(/%20/g, '+');
    url = url.replace(encodedGenericScope, encodedPresetScope);
    url = url.replace('openid+profile+email+read%3Aphotos', encodedPresetScope);

    adapted.httpRequest.url = url;

    // Adapt Headers
    if (adapted.httpRequest.headers) {
      if (adapted.httpRequest.headers['Host']) {
        if (url.startsWith(preset.apiUrl)) {
          adapted.httpRequest.headers['Host'] = apiHost;
        } else {
          adapted.httpRequest.headers['Host'] = authHost;
        }
      }
    }

    // Adapt Request Body
    if (adapted.httpRequest.body) {
      let body = adapted.httpRequest.body;
      body = body.replace(genericPreset.clientId, preset.clientId);
      adapted.httpRequest.body = body;
    }
  }

  // 2. Adapt HTTP Response
  if (adapted.httpResponse && adapted.httpResponse.body) {
    try {
      const parsedBody = JSON.parse(adapted.httpResponse.body);
      
      // If UserInfo response
      if (parsedBody.sub && parsedBody.email) {
        if (presetId === 'google') {
          parsedBody.sub = '109283019283019283';
          parsedBody.name = 'Alex Rivera';
          parsedBody.given_name = 'Alex';
          parsedBody.family_name = 'Rivera';
          parsedBody.picture = 'https://lh3.googleusercontent.com/a/ACg8ocISample';
          parsedBody.email = 'alex.rivera@gmail.com';
          parsedBody.email_verified = true;
          parsedBody.locale = 'en';
        } else if (presetId === 'github') {
          parsedBody.login = 'alexrivera';
          parsedBody.id = 5829104;
          parsedBody.name = 'Alex Rivera';
          parsedBody.avatar_url = 'https://avatars.githubusercontent.com/u/5829104';
          parsedBody.html_url = 'https://github.com/alexrivera';
          parsedBody.type = 'User';
          parsedBody.public_repos = 18;
          parsedBody.email = 'alex.rivera@users.noreply.github.com';
        } else if (presetId === 'auth0') {
          parsedBody.sub = 'auth0|648a9f201b20bfa43e01';
          parsedBody.nickname = 'alex';
          parsedBody.name = 'Alex Rivera';
          parsedBody.picture = 'https://s.gravatar.com/avatar/sample?s=480&r=pg&d=mp';
          parsedBody.email = 'alex.rivera@company.com';
          parsedBody.email_verified = true;
        }
        adapted.httpResponse.body = JSON.stringify(parsedBody, null, 2);
      }

      // If Token Response body contains scope
      if (parsedBody.access_token && parsedBody.scope) {
        parsedBody.scope = preset.defaultScope;
        adapted.httpResponse.body = JSON.stringify(parsedBody, null, 2);
      }
    } catch {
      // Body is not JSON (e.g. redirect text or HTML)
    }

    // Adapt Response Headers
    if (adapted.httpResponse.headers && adapted.httpResponse.headers['Location']) {
      let loc = adapted.httpResponse.headers['Location'];
      loc = loc.replace(genericPreset.clientId, preset.clientId);
      adapted.httpResponse.headers['Location'] = loc;
    }
  }

  // 3. Adapt Parameters
  if (adapted.parameters && Array.isArray(adapted.parameters)) {
    adapted.parameters = adapted.parameters.map(param => {
      if (param.name === 'client_id') {
        return { ...param, value: preset.clientId };
      }
      if (param.name === 'scope') {
        return { ...param, value: preset.defaultScope };
      }
      if (param.name === 'redirect_uri' && presetId === 'github') {
        return { ...param, value: 'https://myapp.com/api/auth/callback/github' };
      }
      return param;
    });
  }

  // 4. Adapt Tokens Issued
  if (adapted.tokensIssued && adapted.tokensIssued.hasTokens) {
    let issuer = 'https://auth.provider.com';
    if (presetId === 'google') issuer = 'https://accounts.google.com';
    else if (presetId === 'github') issuer = 'https://github.com/login/oauth';
    else if (presetId === 'auth0') issuer = 'https://dev-tenant.us.auth0.com/';

    if (adapted.tokensIssued.accessToken?.payload) {
      adapted.tokensIssued.accessToken.payload.iss = issuer;
      adapted.tokensIssued.accessToken.payload.aud = preset.apiUrl;
      adapted.tokensIssued.accessToken.payload.client_id = preset.clientId;
      adapted.tokensIssued.accessToken.payload.scope = preset.defaultScope;
    }

    if (adapted.tokensIssued.idToken?.payload) {
      adapted.tokensIssued.idToken.payload.iss = issuer;
      adapted.tokensIssued.idToken.payload.aud = preset.clientId;
      if (presetId === 'google') {
        adapted.tokensIssued.idToken.payload.email = 'alex.rivera@gmail.com';
        adapted.tokensIssued.idToken.payload.email_verified = true;
        adapted.tokensIssued.idToken.payload.name = 'Alex Rivera';
      } else if (presetId === 'auth0') {
        adapted.tokensIssued.idToken.payload.sub = 'auth0|648a9f201b20bfa43e01';
        adapted.tokensIssued.idToken.payload.email = 'alex.rivera@company.com';
      }
    }
  }

  return adapted;
}
