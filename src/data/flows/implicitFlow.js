export const IMPLICIT_FLOW = {
  id: 'implicit_flow',
  name: 'Implicit Flow (Deprecated / Insecure)',
  badge: 'DEPRECATED in OAuth 2.1',
  standard: 'RFC 6749 §4.2 (Disallowed in OAuth 2.0 Security BCP & OAuth 2.1)',
  description: 'Historically created for browser SPAs in 2012 when browsers lacked CORS support. Directly returned access tokens in the URL fragment (#access_token=...). Deprecated due to severe security vulnerabilities like token leakage via browser history, Referer headers, and lack of client sender-constraint.',
  isDeprecated: true,
  actors: [
    {
      id: 'user',
      name: 'Resource Owner (Browser)',
      role: 'User Agent / URL Bar',
      color: '#ef4444',
      icon: 'AlertTriangle',
      description: 'The browser URL fragment exposes the raw access token.'
    },
    {
      id: 'client',
      name: 'Vulnerable SPA',
      role: 'Single Page App',
      color: '#f97316',
      icon: 'Laptop',
      description: 'Extracts access token directly from window.location.hash.'
    },
    {
      id: 'authServer',
      name: 'Authorization Server',
      role: 'Identity Provider',
      color: '#a78bfa',
      icon: 'ShieldAlert',
      description: 'Hands access token directly to the browser front-channel.'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Client Requests Token with response_type=token',
      shortTitle: '1. Request Token in URL',
      sender: 'client',
      receiver: 'authServer',
      channel: 'front-channel',
      summary: 'The client redirects the browser with response_type=token (or "id_token token"), asking the Authorization Server to skip the authorization code and directly return an access token.',
      whatHappens: [
        'SPA initiates flow with response_type=token.',
        'No PKCE code_challenge is included.',
        'User logs in and consents to permissions.',
        'Auth server prepares to output the token straight into the URL redirect.'
      ],
      underTheHood: `Why was this invented?
In 2012, Cross-Origin Resource Sharing (CORS) was not universally supported across browsers.
SPAs couldn't make back-channel POST requests to an external auth server domain without triggering CORS errors.
Returning the token in the URL fragment (#) avoided a back-channel request.`,
      securitySpotlight: {
        type: 'danger',
        title: 'Vulnerability: Token in Browser History & Referer Headers',
        text: 'Because the token is returned in the URL fragment, any malicious third-party analytics script, browser extension, or open-redirect vulnerability on the SPA can read window.location.hash and exfiltrate the raw Access Token!'
      },
      parameters: [
        { name: 'response_type', value: 'token', required: true, desc: 'DANGEROUS: requests token directly without intermediate code.' },
        { name: 'client_id', value: 'legacy-spa-client', required: true, desc: 'Client identifier.' },
        { name: 'redirect_uri', value: 'https://myspa.com/#/callback', required: true, desc: 'SPA URL expecting token in fragment.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://auth.provider.com/oauth/v2/authorize?response_type=token&client_id=legacy-spa-client&redirect_uri=https%3A%2F%2Fmyspa.com%2F%23%2Fcallback&scope=read%3Adata&state=csrf123',
        headers: {
          'Host': 'auth.provider.com'
        },
        body: null
      },
      httpResponse: {
        status: 302,
        statusText: 'Found',
        headers: {
          'Location': 'https://myspa.com/#/callback#access_token=eyJhbGciOiJ...&token_type=Bearer&expires_in=3600&state=csrf123'
        },
        body: null
      }
    },
    {
      id: 2,
      title: 'Token Exposed in Front-Channel URL Hash',
      shortTitle: '2. Token in URL Hash',
      sender: 'authServer',
      receiver: 'client',
      channel: 'front-channel',
      summary: 'The browser receives the redirect containing the plaintext access token in the URL fragment (#access_token=...). The SPA script parses the hash to obtain the token.',
      whatHappens: [
        'Browser navigates to: https://myspa.com/#/callback#access_token=eyJhbG...&expires_in=3600.',
        'JavaScript executes: const token = window.location.hash.match(/access_token=([^&]*)/)[1].',
        'No back-channel token exchange occurs. No client verification exists.',
        'No refresh tokens can ever be issued in this flow (too dangerous to expose in browser URL).'
      ],
      underTheHood: `Fragment Identifier Leakage:
Although HTTP fragments (#) are not sent to the web server in the HTTP request line, the fragment remains in the browser address bar, browser history, and is accessible to ANY script executing on the origin.
OAuth 2.1 completely removes the Implicit grant. Use Authorization Code + PKCE instead!`,
      securitySpotlight: {
        type: 'danger',
        title: 'Why OAuth 2.1 Completely Bans Implicit Flow',
        text: '1. No sender-constraint or client authentication.\n2. Access token leakage through malicious browser extensions.\n3. Tokens stored in browser history.\n4. Vulnerable to access token injection attacks.'
      },
      parameters: [
        { name: 'access_token', value: 'eyJhbGciOiJSUzI1Ni...[EXPOSED_IN_URL]', required: true, desc: 'Bearer token directly exposed in URL fragment!' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://myspa.com/#/callback#access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...&token_type=Bearer&expires_in=3600',
        headers: {
          'Host': 'myspa.com'
        },
        body: null
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html'
        },
        body: '<!-- SPA parses window.location.hash -->'
      }
    }
  ]
};
