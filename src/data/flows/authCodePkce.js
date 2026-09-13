export const AUTH_CODE_PKCE_FLOW = {
  id: 'auth_code_pkce',
  name: 'Authorization Code Flow with PKCE',
  badge: 'Recommended Standard',
  standard: 'RFC 7636 + RFC 6749 + OIDC Core 1.0',
  description: 'The modern gold-standard authentication & authorization flow for Single Page Applications (SPAs), Mobile apps, and Server-side Web apps. Uses Proof Key for Code Exchange (PKCE) to prevent code interception attacks.',
  actors: [
    {
      id: 'user',
      name: 'Resource Owner',
      role: 'End User / Browser',
      color: '#38bdf8',
      icon: 'User',
      description: 'The human user who owns the account and identity data.'
    },
    {
      id: 'client',
      name: 'Client App',
      role: 'Single Page App / Web App',
      color: '#34d399',
      icon: 'Laptop',
      description: 'The application seeking access to the user\'s resources.'
    },
    {
      id: 'authServer',
      name: 'Auth Server (IdP)',
      role: 'Identity Provider',
      color: '#a78bfa',
      icon: 'ShieldCheck',
      description: 'Authenticates user, asks consent, issues codes & tokens.'
    },
    {
      id: 'resourceServer',
      name: 'Resource Server',
      role: 'Protected API',
      color: '#fbbf24',
      icon: 'Server',
      description: 'Houses protected user data (photos, profile, contacts).'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Generate PKCE & Initiate Authorization',
      shortTitle: '1. Initiate & PKCE',
      sender: 'client',
      receiver: 'user',
      channel: 'front-channel',
      summary: 'The client application generates a secret code verifier, derives a cryptographic challenge, creates a CSRF state token, and redirects the browser to the Authorization Server.',
      whatHappens: [
        'User clicks "Log in with OAuth/Google" inside the Client Application.',
        'Client creates a high-entropy random string called the code_verifier (43–128 chars).',
        'Client calculates SHA-256 hash of the verifier and base64url encodes it to create the code_challenge.',
        'Client creates a cryptographically secure random state parameter to safeguard against Cross-Site Request Forgery (CSRF).',
        'Client constructs the authorization URL and redirects the user’s browser via HTTP 302.'
      ],
      underTheHood: `The client prepares the front-channel redirect:
1. code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
2. code_challenge = BASE64URL(SHA256(code_verifier)) = "E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c"
3. code_challenge_method = "S256"
4. state = "xyz_9847129482" (stored in sessionStorage)
5. nonce = "nonce_abc123" (prevents token replay in OIDC)

The browser is instructed to navigate to the authorization endpoint with these parameters as query parameters.`,
      securitySpotlight: {
        type: 'success',
        title: 'Why PKCE is Essential for Public Clients',
        text: 'Public clients (SPAs, mobile apps) cannot safely store a client_secret because all code can be inspected or decompiled. PKCE dynamically binds the authorization request to the token exchange step. Even if a malicious app intercepts the authorization code, it cannot exchange it without the code_verifier!'
      },
      parameters: [
        { name: 'response_type', value: 'code', required: true, desc: 'Tells the auth server the client expects an authorization code.' },
        { name: 'client_id', value: 'my-web-app-client-id-74892', required: true, desc: 'Public identifier for the registered client application.' },
        { name: 'redirect_uri', value: 'https://myapp.com/callback', required: true, desc: 'Where the auth server must send the user after authorization.' },
        { name: 'scope', value: 'openid profile email read:photos', required: true, desc: 'Access permissions requested from the user.' },
        { name: 'code_challenge', value: 'E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c', required: true, desc: 'SHA-256 hash of the generated code_verifier.' },
        { name: 'code_challenge_method', value: 'S256', required: true, desc: 'Cryptographic algorithm used to create the challenge (always use S256, never "plain").' },
        { name: 'state', value: 'xyz_9847129482', required: true, desc: 'Opaque value used by the client to maintain state and prevent CSRF attacks.' },
        { name: 'nonce', value: 'nonce_abc123', required: false, desc: 'OIDC value to bind client session with the issued ID Token.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://auth.provider.com/oauth/v2/authorize?response_type=code&client_id=my-web-app-client-id-74892&redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback&scope=openid%20profile%20email%20read%3Aphotos&code_challenge=E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c&code_challenge_method=S256&state=xyz_9847129482&nonce=nonce_abc123',
        headers: {
          'Host': 'auth.provider.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9'
        },
        body: null
      },
      httpResponse: {
        status: 302,
        statusText: 'Found',
        headers: {
          'Location': 'https://auth.provider.com/login?client_id=my-web-app-client-id-74892...',
          'Set-Cookie': '__Host-auth-session=e3b0c44298fc; Secure; HttpOnly; SameSite=Lax'
        },
        body: null
      }
    },
    {
      id: 2,
      title: 'User Authentication & Scope Consent',
      shortTitle: '2. Login & Consent',
      sender: 'user',
      receiver: 'authServer',
      channel: 'front-channel',
      summary: 'The browser renders the Authorization Server\'s login page. The user authenticates (e.g. password, MFA, passkey) and reviews/approves the requested permission scopes.',
      whatHappens: [
        'The Authorization Server validates client_id and checks that redirect_uri is strictly registered in client settings.',
        'Auth Server prompts the user to enter their credentials (username/password, biometric Passkey, or 2FA push).',
        'Auth Server presents a Consent Screen: "MyApp wants to: view your email address, access your photos".',
        'User reviews the permissions and clicks "Allow / Authorize".',
        'Auth Server records the consent and creates an internal one-time authorization code, binding it to the client_id, redirect_uri, and the code_challenge.'
      ],
      underTheHood: `The client application NEVER sees or touches the user's password or credentials!
Authentication occurs entirely on the isolated domain of the Authorization Server.
If the user already has an active session cookie on auth.provider.com, the login step may be bypassed seamlessly (Single Sign-On).`,
      securitySpotlight: {
        type: 'warning',
        title: 'Redirect URI Strict Matching Rule',
        text: 'The Authorization Server MUST perform strict exact string matching on the redirect_uri against pre-registered URIs. Subdomain wildcards or open redirects can allow attackers to steal the authorization code via URL hijacking!'
      },
      parameters: [
        { name: 'username', value: 'alice@example.com', required: true, desc: 'User credential entered directly into Auth Server login screen.' },
        { name: 'consent_granted', value: 'true', required: true, desc: 'Explicit approval given by user for requested scopes.' },
        { name: 'bound_challenge', value: 'E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c', required: true, desc: 'Stored server-side with code expiry timer (typically 60s).' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/login/submit',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://auth.provider.com',
          'Cookie': '__Host-auth-session=e3b0c44298fc'
        },
        body: 'username=alice%40example.com&password=********&consent=allow&scope=openid+profile+email+read%3Aphotos'
      },
      httpResponse: {
        status: 302,
        statusText: 'Found',
        headers: {
          'Location': 'https://myapp.com/callback?code=splat_9a8b7c6d5e4f3a2b1c&state=xyz_9847129482',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: null
      }
    },
    {
      id: 3,
      title: 'Auth Code Returned to Client via Callback',
      shortTitle: '3. Code Callback',
      sender: 'authServer',
      receiver: 'client',
      channel: 'front-channel',
      summary: 'The Authorization Server redirects the user\'s browser back to the registered redirect_uri, passing the single-use Authorization Code and the unmodified state token in query parameters.',
      whatHappens: [
        'Auth Server sends HTTP 302 redirect with target: https://myapp.com/callback?code=splat_...&state=xyz_...',
        'Browser follows redirect and loads the Client Application callback page.',
        'Client reads the returned "state" parameter from URL query params and checks if it exactly matches the state value stored in sessionStorage in Step 1.',
        'If state doesn\'t match, client immediately terminates the flow (prevents CSRF).',
        'If state matches, client extracts the "code" parameter to use in the upcoming token exchange.'
      ],
      underTheHood: `Notice that this message travels through the front-channel (the browser URL bar).
Because it passes through the browser, it is temporarily visible in browser history and HTTP referrer headers.
This is why the code is NOT an access token! It is merely a short-lived voucher (typically 30–60 seconds lifetime) that is useless without the secret PKCE code_verifier.`,
      securitySpotlight: {
        type: 'danger',
        title: 'CSRF Defense with State Validation',
        text: 'If the client neglected to verify the state parameter, an attacker could trick an unsuspecting victim into finishing an authorization code exchange with the attacker\'s authorization code, binding the victim\'s session to the attacker\'s account!'
      },
      parameters: [
        { name: 'code', value: 'splat_9a8b7c6d5e4f3a2b1c', required: true, desc: 'Short-lived single-use authorization code.' },
        { name: 'state', value: 'xyz_9847129482', required: true, desc: 'State token echoed back to confirm request originated from this user agent.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://myapp.com/callback?code=splat_9a8b7c6d5e4f3a2b1c&state=xyz_9847129482',
        headers: {
          'Host': 'myapp.com',
          'Referer': 'https://auth.provider.com/'
        },
        body: null
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        },
        body: '<!-- Client SPA initializes callback handler -->'
      }
    },
    {
      id: 4,
      title: 'Back-Channel Token Exchange (PKCE Verification)',
      shortTitle: '4. Token Exchange',
      sender: 'client',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'The client sends an HTTP POST request directly to the Authorization Server\'s /token endpoint, submitting the authorization code alongside the original unhashed code_verifier.',
      whatHappens: [
        'Client retrieves the stored code_verifier from local storage/memory.',
        'Client sends a direct HTTPS POST request to https://auth.provider.com/oauth/v2/token.',
        'Payload contains: grant_type=authorization_code, code, redirect_uri, client_id, and code_verifier.',
        'The Authorization Server receives the request via the secure back-channel.',
        'The server recalculates BASE64URL(SHA256(code_verifier)) and compares the resulting hash with the code_challenge received in Step 1.',
        'If the hash matches, the server verifies the authorization code is valid, unexpired, and hasn\'t been used yet.'
      ],
      underTheHood: `Cryptographic Verification Formula:
Stored Challenge: "E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c"
Received Verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
Server computes: BASE64URL(SHA-256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"))
Result: "E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c" -> MATCH!

Because the code_verifier was never sent across the network until now (and only over back-channel HTTPS directly to the token endpoint), an attacker eavesdropping on the browser could never have guessed it.`,
      securitySpotlight: {
        type: 'success',
        title: 'Single-Use Code Rule (Replay Detection)',
        text: 'RFC 6749 §4.1.2 strictly mandates that authorization codes can only be used once. If the Auth Server detects an attempt to redeem the same code twice, it must immediately revoke all tokens previously issued for that code to foil an active intrusion.'
      },
      parameters: [
        { name: 'grant_type', value: 'authorization_code', required: true, desc: 'OAuth grant type being executed.' },
        { name: 'client_id', value: 'my-web-app-client-id-74892', required: true, desc: 'Public client ID.' },
        { name: 'code', value: 'splat_9a8b7c6d5e4f3a2b1c', required: true, desc: 'Authorization code obtained in step 3.' },
        { name: 'redirect_uri', value: 'https://myapp.com/callback', required: true, desc: 'Must match the redirect_uri used in Step 1.' },
        { name: 'code_verifier', value: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', required: true, desc: 'The plaintext secret random string created in Step 1.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=authorization_code&client_id=my-web-app-client-id-74892&code=splat_9a8b7c6d5e4f3a2b1c&redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTE4MjM0IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnByb3ZpZGVyLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLnByb3ZpZGVyLmNvbSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpwaG90b3MiLCJleHAiOjE3MjYyODcyMDAsImlhdCI6MTcyNjI4MzYwMH0.Kj7X1nQ_dummy_signature_at',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'rfr_7b8a9c0d1e2f3a4b5c6d',
          id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0xIn0.eyJzdWIiOiJ1c3JfOTE4MjM0IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnByb3ZpZGVyLmNvbSIsImF1ZCI6Im15LXdlYi1hcHAtY2xpZW50LWlkLTc0ODkyIiwibm9uY2UiOiJub25jZV9hYmMxMjMiLCJuYW1lIjoiQWxpY2UgSm9obnNvbiIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZXhwIjoxNzI2Mjg3MjAwLCJpYXQiOjE3MjYyODM2MDB9.s8U2mR_dummy_signature_id'
        }, null, 2)
      },
      tokensIssued: {
        hasTokens: true,
        accessToken: {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: {
            sub: 'usr_918234',
            iss: 'https://auth.provider.com',
            aud: 'https://api.provider.com',
            scope: 'openid profile email read:photos',
            exp: 1726287200,
            iat: 1726283600
          }
        },
        idToken: {
          header: { alg: 'RS256', kid: 'key-1' },
          payload: {
            sub: 'usr_918234',
            iss: 'https://auth.provider.com',
            aud: 'my-web-app-client-id-74892',
            nonce: 'nonce_abc123',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            email_verified: true,
            exp: 1726287200,
            iat: 1726283600
          }
        }
      }
    },
    {
      id: 5,
      title: 'Accessing Protected Resource with Bearer Token',
      shortTitle: '5. Access API',
      sender: 'client',
      receiver: 'resourceServer',
      channel: 'back-channel',
      summary: 'The client application uses the newly minted Access Token to make an authorized HTTP request to the Resource Server (API) via the Authorization: Bearer header.',
      whatHappens: [
        'Client constructs an API call (e.g. GET /api/v1/photos/recent).',
        'Client attaches the header: Authorization: Bearer eyJhbGciOiJSUzI1NiIs...',
        'Resource Server receives the request and extracts the Bearer token.',
        'Resource Server validates the token signature using the Auth Server\'s public JWKS keys.',
        'Resource Server checks that exp (expiration) is in the future, and that scope includes "read:photos".',
        'Once verified, the Resource Server serves the protected data to the client.'
      ],
      underTheHood: `The Resource Server can validate the Access Token in two distinct ways:
1. Self-contained JWT validation (Stateless): Server downloads public keys from https://auth.provider.com/.well-known/jwks.json and verifies cryptographic signature locally without contacting Auth Server.
2. Token Introspection (RFC 7662): Server makes an introspection POST /oauth/introspect to the Auth Server for opaque reference tokens.`,
      securitySpotlight: {
        type: 'info',
        title: 'Bearer Token Rule',
        text: 'A Bearer token is like cash — anyone who possesses it can spend it! It MUST always be transmitted over HTTPS (TLS encryption) and should NEVER be written to unencrypted logs or exposed in URL query parameters.'
      },
      parameters: [
        { name: 'Authorization', value: 'Bearer eyJhbGciOiJSUzI1Ni...', required: true, desc: 'Bearer credential standard per RFC 6750.' },
        { name: 'Accept', value: 'application/json', required: true, desc: 'Response format requested.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://api.provider.com/v1/photos/recent?limit=3',
        headers: {
          'Host': 'api.provider.com',
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Accept': 'application/json'
        },
        body: null
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '98'
        },
        body: JSON.stringify({
          photos: [
            { id: 'pho_101', title: 'Sunset at Alps', created_at: '2026-09-10T14:20:00Z', url: 'https://cdn.provider.com/pho_101.jpg' },
            { id: 'pho_102', title: 'Cyberpunk Tokyo', created_at: '2026-09-12T18:45:00Z', url: 'https://cdn.provider.com/pho_102.jpg' },
            { id: 'pho_103', title: 'Mountain Coffee', created_at: '2026-09-13T08:15:00Z', url: 'https://cdn.provider.com/pho_103.jpg' }
          ],
          total_count: 3
        }, null, 2)
      }
    }
  ]
};
