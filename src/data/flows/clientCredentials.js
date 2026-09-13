export const CLIENT_CREDENTIALS_FLOW = {
  id: 'client_credentials',
  name: 'Client Credentials Flow',
  badge: 'Machine to Machine (M2M)',
  standard: 'RFC 6749 §4.4',
  description: 'Used for automated machine-to-machine (M2M) communication, microservices, background daemons, and cron jobs. There is no user interface, browser, or end-user involved; the client acts autonomously on its own behalf.',
  actors: [
    {
      id: 'client',
      name: 'Backend Daemon / M2M Client',
      role: 'Confidential Service',
      color: '#34d399',
      icon: 'Cpu',
      description: 'The background worker service requesting data.'
    },
    {
      id: 'authServer',
      name: 'Authorization Server',
      role: 'Token Issuer',
      color: '#a78bfa',
      icon: 'ShieldCheck',
      description: 'Authenticates client credentials and issues service tokens.'
    },
    {
      id: 'resourceServer',
      name: 'Resource Server (API)',
      role: 'Internal Microservice',
      color: '#fbbf24',
      icon: 'Server',
      description: 'Houses internal services (billing API, telemetry, analytics).'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Client Authenticates Directly with Auth Server',
      shortTitle: '1. Request Service Token',
      sender: 'client',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'The client backend presents its client_id and confidential client_secret directly to the /token endpoint via HTTP Basic Auth or POST body.',
      whatHappens: [
        'The background daemon needs to sync database records with an external service.',
        'Client connects directly to the Authorization Server over TLS/HTTPS (no browser involved).',
        'Client sends a POST request with grant_type=client_credentials and requested scopes (e.g. system:sync).',
        'Authentication credentials (client_id:client_secret) are sent in the Authorization: Basic header.',
        'Auth Server verifies the credentials against its registry of trusted confidential services.'
      ],
      underTheHood: `Notice that NO USER is involved in this flow!
The "Resource Owner" is the client application itself or the organization holding the service account.
Because the service runs on a protected backend server, it can securely store a confidential client_secret.`,
      securitySpotlight: {
        type: 'warning',
        title: 'Confidential Clients Only!',
        text: 'This flow MUST NEVER be used by public clients (SPAs, React apps, iOS/Android apps) because anyone can decompile the app and steal the client_secret, gaining unrestricted access to backend resources!'
      },
      parameters: [
        { name: 'grant_type', value: 'client_credentials', required: true, desc: 'OAuth grant type for machine-to-machine authorization.' },
        { name: 'scope', value: 'billing:read analytics:write', required: false, desc: 'Service-level permissions requested.' },
        { name: 'Authorization', value: 'Basic bXktc2VydmljZS1pZDpjb25maWRlbnRpYWwtc2VjcmV0LTk5', required: true, desc: 'Base64 encoded "client_id:client_secret".' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Authorization': 'Basic bXktc2VydmljZS1pZDpjb25maWRlbnRpYWwtc2VjcmV0LTk5',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=billing%3Aread%20analytics%3Awrite'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRfc3ZjXzk5MTIiLCJpc3MiOiJodHRwczovL2F1dGgucHJvdmlkZXIuY29tIiwiYXVkIjoiaHR0cHM6Ly9hcGkucHJvdmlkZXIuY29tIiwic2NvcGUiOiJiaWxsaW5nOnJlYWQgYW5hbHl0aWNzOndyaXRlIiwiZXhwIjoxNzI2Mjg3MjAwLCJpYXQiOjE3MjYyODM2MDB9.m4X7_signature_svc',
          token_type: 'Bearer',
          expires_in: 3600
        }, null, 2)
      },
      tokensIssued: {
        hasTokens: true,
        accessToken: {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: {
            sub: 'client_svc_9912',
            iss: 'https://auth.provider.com',
            aud: 'https://api.provider.com',
            scope: 'billing:read analytics:write',
            exp: 1726287200,
            iat: 1726283600
          }
        }
      }
    },
    {
      id: 2,
      title: 'Service Accesses API Using M2M Token',
      shortTitle: '2. Perform API Call',
      sender: 'client',
      receiver: 'resourceServer',
      channel: 'back-channel',
      summary: 'The client service presents the issued Bearer access token to the internal Resource Server to perform authorized operational tasks.',
      whatHappens: [
        'Client includes the token in the Authorization: Bearer header of its API request.',
        'Resource Server validates the signature and reads the scope claim ("billing:read").',
        'Resource Server executes the query and returns the authorized data payload.',
        'Note: Refresh tokens are NOT issued in client credentials flow; when expired, the service simply requests a new token with its credentials.'
      ],
      underTheHood: `No refresh token is needed:
Because the backend client holds the static client credentials securely in an environment variable or Secret Manager (e.g. AWS KMS, HashiCorp Vault), it can simply request a new access token whenever the previous one expires.`,
      securitySpotlight: {
        type: 'info',
        title: 'Principle of Least Privilege',
        text: 'M2M scopes should be strictly scoped per service. For example, an invoice processor daemon should only have "invoices:read", never broad administrative scopes.'
      },
      parameters: [
        { name: 'Authorization', value: 'Bearer eyJhbGciOiJSUzI1Ni...', required: true, desc: 'Bearer token issued for client service identity.' }
      ],
      httpRequest: {
        method: 'GET',
        url: 'https://api.provider.com/v1/billing/reports/monthly',
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          period: '2026-08',
          total_revenue_usd: 148520.00,
          invoices_processed: 412,
          status: 'reconciled'
        }, null, 2)
      }
    }
  ]
};
