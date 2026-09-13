export const AUTH_CODE_SECRET_FLOW = {
  id: 'auth_code_secret',
  name: 'Authorization Code (Confidential Client / Server-Side)',
  badge: 'Traditional Web Servers',
  standard: 'RFC 6749 §4.1',
  description: 'The standard flow for traditional backend web applications (Node.js/Express, Python/Django, Ruby on Rails, Go, Java) where code executes on a private web server that can keep a client_secret strictly confidential.',
  actors: [
    {
      id: 'user',
      name: 'Resource Owner',
      role: 'End User / Browser',
      color: '#38bdf8',
      icon: 'User',
      description: 'End user authenticating in browser.'
    },
    {
      id: 'client',
      name: 'Backend Web Server',
      role: 'Confidential Client',
      color: '#34d399',
      icon: 'Server',
      description: 'Server with protected environment variables (client_secret).'
    },
    {
      id: 'authServer',
      name: 'Authorization Server',
      role: 'Identity Provider',
      color: '#a78bfa',
      icon: 'ShieldCheck',
      description: 'Authenticates user and verifies client_secret.'
    },
    {
      id: 'resourceServer',
      name: 'Resource Server',
      role: 'Protected API',
      color: '#fbbf24',
      icon: 'Database',
      description: 'Provides protected resources.'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Redirect User to Authorization Server with State',
      shortTitle: '1. Initiate Auth',
      sender: 'client',
      receiver: 'user',
      channel: 'front-channel',
      summary: 'The backend web server redirects the browser to the Authorization Server with response_type=code, client_id, redirect_uri, and a cryptographic CSRF state token.',
      whatHappens: [
        'User clicks "Log in with GitHub / Google" on the web app.',
        'Backend generates an unguessable state token, stores it in the encrypted user session cookie.',
        'Backend returns an HTTP 302 redirecting the browser to the Auth Server authorization endpoint.'
      ],
      underTheHood: `Notice that in this flow, because the server is confidential, PKCE was historically optional.
However, modern best practices (OAuth 2.1) recommend using PKCE even for confidential clients as defense-in-depth!`,
      securitySpotlight: {
        type: 'info',
        title: 'Confidential vs Public Client Distinction',
        text: 'A confidential client is able to maintain the confidentiality of its credentials (e.g., client_secret stored in private backend environment variables), unlike public SPAs where code is delivered to the browser.'
      },
      parameters: [
        { name: 'response_type', value: 'code', required: true, desc: 'Requests authorization code.' },
        { name: 'client_id', value: 'confidential-web-srv-89', required: true, desc: 'Registered client ID.' },
        { name: 'redirect_uri', value: 'https://backend.app.com/oauth/callback', required: true, desc: 'Backend callback URL.' },
        { name: 'state', value: 'sec_state_491823901', required: true, desc: 'CSRF token saved in server session.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://auth.provider.com/oauth/v2/authorize?response_type=code&client_id=confidential-web-srv-89&redirect_uri=https%3A%2F%2Fbackend.app.com%2Foauth%2Fcallback&scope=user%3Aemail%20repo&state=sec_state_491823901',
        headers: {
          'Host': 'auth.provider.com'
        },
        body: null
      },
      httpResponse: {
        status: 302,
        statusText: 'Found',
        headers: {
          'Location': 'https://auth.provider.com/login?...'
        },
        body: null
      }
    },
    {
      id: 2,
      title: 'User Authenticates & Grants Authorization',
      shortTitle: '2. User Login & Consent',
      sender: 'user',
      receiver: 'authServer',
      channel: 'front-channel',
      summary: 'User authenticates at the IdP and authorizes the backend application to access requested scopes.',
      whatHappens: [
        'User completes authentication (credentials / 2FA).',
        'User confirms consent screen permissions.',
        'Auth Server issues temporary authorization code.'
      ],
      underTheHood: `Credentials are verified directly against IdP identity store.`,
      securitySpotlight: {
        type: 'warning',
        title: 'Consent Fatigue Awareness',
        text: 'OAuth apps should only request permissions immediately required rather than asking for full account access upfront.'
      },
      parameters: [
        { name: 'consent', value: 'true', required: true, desc: 'User approval.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/login/submit',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'username=bob%40domain.com&password=********&consent=allow'
      },
      httpResponse: {
        status: 302,
        statusText: 'Found',
        headers: {
          'Location': 'https://backend.app.com/oauth/callback?code=splat_code_7718&state=sec_state_491823901'
        },
        body: null
      }
    },
    {
      id: 3,
      title: 'Callback Delivers Authorization Code to Backend',
      shortTitle: '3. Code Callback',
      sender: 'authServer',
      receiver: 'client',
      channel: 'front-channel',
      summary: 'Browser returns to backend callback endpoint. The server verifies the returned state matches the session state cookie.',
      whatHappens: [
        'Browser hits GET /oauth/callback?code=splat_code_7718&state=sec_state_491823901.',
        'Backend compares received state parameter with state in session.',
        'State matches -> Valid request! Backend prepares to redeem code.'
      ],
      underTheHood: `If state doesn't match, server responds with HTTP 403 Forbidden (CSRF attack detected).`,
      securitySpotlight: {
        type: 'danger',
        title: 'CSRF Attack Prevention',
        text: 'The state parameter guarantees that the browser completing the authorization flow is the identical user agent that initiated it.'
      },
      parameters: [
        { name: 'code', value: 'splat_code_7718', required: true, desc: 'Single-use authorization code.' },
        { name: 'state', value: 'sec_state_491823901', required: true, desc: 'CSRF state verification token.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://backend.app.com/oauth/callback?code=splat_code_7718&state=sec_state_491823901',
        headers: {
          'Host': 'backend.app.com',
          'Cookie': 'session_id=sess_9918274; csrf_state=sec_state_491823901'
        },
        body: null
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Processing authorization...'
      }
    },
    {
      id: 4,
      title: 'Backend Exchanges Code + Client Secret for Tokens',
      shortTitle: '4. Token Exchange (Secret)',
      sender: 'client',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'The backend web server makes a server-to-server POST request to /token presenting its confidential client_secret along with the authorization code.',
      whatHappens: [
        'Backend makes POST /oauth/v2/token directly over TLS.',
        'Credentials provided: client_id + client_secret (in Authorization: Basic header or body).',
        'Payload: grant_type=authorization_code, code=splat_code_7718, redirect_uri.',
        'Auth Server verifies both the authorization code AND the client_secret.',
        'Auth Server responds with Access Token and Refresh Token.'
      ],
      underTheHood: `Because client_secret is sent directly over back-channel HTTPS between the web server and the Auth Server, the browser never sees the client_secret or the tokens!
The backend creates a normal HTTP-only session cookie for the browser.`,
      securitySpotlight: {
        type: 'success',
        title: 'Token Seclusion Pattern',
        text: 'In confidential web apps, the tokens never enter the browser! The backend stores tokens in a server-side session or database, completely shielding them from browser XSS attacks.'
      },
      parameters: [
        { name: 'grant_type', value: 'authorization_code', required: true, desc: 'Authorization code grant.' },
        { name: 'code', value: 'splat_code_7718', required: true, desc: 'The authorization code from callback.' },
        { name: 'client_id', value: 'confidential-web-srv-89', required: true, desc: 'Client identifier.' },
        { name: 'client_secret', value: 'sec_live_998a7b6c5d4e3f2a1', required: true, desc: 'Confidential secret known only to server and IdP.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Authorization': 'Basic Y29uZmlkZW50aWFsLXdlYi1zcnYtODk6c2VjX2xpdmVfOTk4YTdiNmM1ZDRlM2YyYTE=',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=authorization_code&code=splat_code_7718&redirect_uri=https%3A%2F%2Fbackend.app.com%2Foauth%2Fcallback'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfNDgxODk0Iiwic2NvcGUiOiJ1c2VyOmVtYWlsIHJlcG8iLCJleHAiOjE3MjYyODcyMDB9.conf_token_val',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'rfr_conf_9981248102'
        }, null, 2)
      },
      tokensIssued: {
        hasTokens: true,
        accessToken: {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: {
            sub: 'usr_481894',
            iss: 'https://auth.provider.com',
            aud: 'https://api.github.com',
            scope: 'user:email repo',
            exp: 1726287200,
            iat: 1726283600
          }
        }
      }
    },
    {
      id: 5,
      title: 'Backend Calls Resource Server & Establishes User Session',
      shortTitle: '5. Call API & Session',
      sender: 'client',
      receiver: 'resourceServer',
      channel: 'back-channel',
      summary: 'The backend calls the API using the Bearer token, stores the user details in its database, sets an HTTP-only session cookie for the user, and redirects the user to the app dashboard.',
      whatHappens: [
        'Backend fetches user profile from API with Bearer token.',
        'Backend writes authenticated session to database or Redis.',
        'Backend sends HTTP 302 to user browser: Set-Cookie: session_token=...; HttpOnly; Secure; SameSite=Lax.',
        'User browser loads dashboard: "Welcome back, Bob!"'
      ],
      underTheHood: `The end user\'s browser only ever deals with a regular first-party session cookie.
All OAuth tokens remain securely insulated on the backend server.`,
      securitySpotlight: {
        type: 'info',
        title: 'Defense in Depth with HttpOnly Cookies',
        text: 'HttpOnly cookies cannot be read by JavaScript (document.cookie), protecting users from session hijacking even if an XSS vulnerability exists on the frontend.'
      },
      parameters: [
        { name: 'Authorization', value: 'Bearer conf_token_val...', required: true, desc: 'Bearer token.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://api.provider.com/user/profile',
        headers: {
          'Host': 'api.provider.com',
          'Authorization': 'Bearer conf_token_val...',
          'Accept': 'application/json'
        },
        body: null
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'usr_481894',
          name: 'Bob Martinez',
          email: 'bob@domain.com',
          repos_count: 14
        }, null, 2)
      }
    }
  ]
};
