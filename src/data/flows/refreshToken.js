export const REFRESH_TOKEN_FLOW = {
  id: 'refresh_token',
  name: 'Refresh Token Flow',
  badge: 'Token Renewal',
  standard: 'RFC 6749 §6',
  description: 'Explains how client applications renew expired access tokens silently in the background without forcing the user to log in again, including Refresh Token Rotation security.',
  actors: [
    {
      id: 'client',
      name: 'Client Application',
      role: 'Web / Mobile / Backend App',
      color: '#34d399',
      icon: 'Laptop',
      description: 'Holds an expired access token and a valid refresh token.'
    },
    {
      id: 'authServer',
      name: 'Authorization Server',
      role: 'Token Authority',
      color: '#a78bfa',
      icon: 'ShieldCheck',
      description: 'Validates refresh token and issues fresh token pair.'
    },
    {
      id: 'resourceServer',
      name: 'Resource Server (API)',
      role: 'Protected API',
      color: '#fbbf24',
      icon: 'Server',
      description: 'Rejects expired token with HTTP 401 Unauthorized.'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'API Call Fails with 401 Unauthorized (Expired Token)',
      shortTitle: '1. Token Expired (401)',
      sender: 'client',
      receiver: 'resourceServer',
      channel: 'back-channel',
      summary: 'The client attempts to make an API request using an access token that has exceeded its lifetime (e.g. older than 60 minutes). The Resource Server detects the expired timestamp and responds with HTTP 401.',
      whatHappens: [
        'Client sends API request with expired Bearer token.',
        'Resource Server inspects JWT exp claim: 1726287200 < Current Time: 1726287205.',
        'Resource Server rejects request immediately with HTTP 401 Unauthorized and WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired".',
        'Client catches the 401 status and initiates the token refresh sequence.'
      ],
      underTheHood: `Short Access Token Lifetimes are deliberate!
Access tokens usually live for only 15 to 60 minutes.
This limits the damage if an access token is intercepted or leaked: the attacker\'s window of access closes rapidly without requiring complex distributed revocation lists.`,
      securitySpotlight: {
        type: 'info',
        title: 'Why Access Tokens Expire Quickly',
        text: 'Because JWT access tokens are validated statelessly by API servers using public keys, an issued JWT cannot easily be revoked on the fly. Giving access tokens a very short lifetime prevents long-term compromise.'
      },
      parameters: [
        { name: 'Authorization', value: 'Bearer eyJhbGciOiJSUzI1Ni...[EXPIRED]', required: true, desc: 'Access token past its exp claim timestamp.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://api.provider.com/v1/user/playlists',
        headers: {
          'Host': 'api.provider.com',
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...[EXPIRED]',
          'Accept': 'application/json'
        },
        body: null
      },
      httpResponse: {
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'WWW-Authenticate': 'Bearer error="invalid_token", error_description="The access token expired"',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'invalid_token',
          message: 'The access token has expired'
        }, null, 2)
      }
    },
    {
      id: 2,
      title: 'Exchange Refresh Token for Fresh Access Token',
      shortTitle: '2. Redeem Refresh Token',
      sender: 'client',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'The client contacts the Authorization Server\'s /token endpoint with grant_type=refresh_token to silently obtain a new access token without disturbing the user.',
      whatHappens: [
        'Client sends POST /oauth/v2/token with grant_type=refresh_token and refresh_token=rfr_7b8a9c0d1e2f3a4b5c6d.',
        'Auth Server verifies that the refresh token is valid, active, and not revoked.',
        'Auth Server implements Refresh Token Rotation (RTR): invalidates old refresh token and issues a NEW refresh token alongside the new access token.',
        'Client updates its local secure storage with the new token pair.'
      ],
      underTheHood: `Refresh Token Rotation (RTR):
Every time a refresh token is exchanged, the Authorization Server generates a brand new refresh token and immediately invalidates the old one.
If an attacker stole the old refresh token and attempts to reuse it later, the server detects token reuse, recognizes a security breach, and immediately revokes all tokens issued to that client!`,
      securitySpotlight: {
        type: 'success',
        title: 'Refresh Token Rotation (RFC 6749 BCP)',
        text: 'RTR provides automated breach detection. In SPAs where tokens reside in the browser, RTR guarantees that compromised refresh tokens cannot be abused repeatedly.'
      },
      parameters: [
        { name: 'grant_type', value: 'refresh_token', required: true, desc: 'Grant type for refreshing tokens.' },
        { name: 'client_id', value: 'my-web-app-client-id-74892', required: true, desc: 'Client application identifier.' },
        { name: 'refresh_token', value: 'rfr_7b8a9c0d1e2f3a4b5c6d', required: true, desc: 'Previously issued long-lived refresh token.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=refresh_token&client_id=my-web-app-client-id-74892&refresh_token=rfr_7b8a9c0d1e2f3a4b5c6d'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTE4MjM0IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnByb3ZpZGVyLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLnByb3ZpZGVyLmNvbSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJleHAiOjE3MjYyOTA4MDAsImlhdCI6MTcyNjI4NzIwMH0.fresh_signature_at',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'rfr_NEW_ROTATED_99x82y71z0'
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
            scope: 'openid profile email',
            exp: 1726290800,
            iat: 1726287200
          }
        }
      }
    },
    {
      id: 3,
      title: 'Retry API Call with Fresh Token (Success)',
      shortTitle: '3. Retry & Succeed',
      sender: 'client',
      receiver: 'resourceServer',
      channel: 'back-channel',
      summary: 'The client transparently retries the original failed API call using the newly obtained access token. The Resource Server validates the new token and returns the requested data.',
      whatHappens: [
        'Client repeats the GET request with the newly issued Bearer token.',
        'Resource Server validates the signature and confirms exp timestamp is fresh.',
        'Request succeeds with HTTP 200 OK.',
        'The end-user experiences zero interruption and never had to re-enter their credentials.'
      ],
      underTheHood: `Modern HTTP clients (e.g. Axios interceptors or Fetch wrappers) automate this flow:
Whenever a 401 response occurs, the client queues pending requests, refreshes the token once, and replays the failed requests seamlessly.`,
      securitySpotlight: {
        type: 'info',
        title: 'Seamless UX without sacrificing security',
        text: 'Refresh tokens enable a delightful user experience (remaining signed in for weeks) while keeping the actual access tokens short-lived (15–60 mins) to restrict security exposure.'
      },
      parameters: [
        { name: 'Authorization', value: 'Bearer fresh_signature_at...', required: true, desc: 'Newly minted Bearer token.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://api.provider.com/v1/user/playlists',
        headers: {
          'Host': 'api.provider.com',
          'Authorization': 'Bearer fresh_signature_at...',
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
          playlists: [
            { id: 'pl_1', name: 'Chill Coding Vibes', tracks_count: 42 },
            { id: 'pl_2', name: 'Synthesizer Waves', tracks_count: 28 }
          ]
        }, null, 2)
      }
    }
  ]
};
