export const DEVICE_FLOW = {
  id: 'device_flow',
  name: 'Device Authorization Flow',
  badge: 'Smart TVs & CLI Tools',
  standard: 'RFC 8628',
  description: 'Designed for Internet-connected devices that either lack a web browser or have restricted input capabilities (such as Smart TVs, gaming consoles, CLI tools, and IoT devices). The user authorizes the device using their smartphone or computer.',
  actors: [
    {
      id: 'device',
      name: 'Constrained Device',
      role: 'Smart TV / CLI / Console',
      color: '#34d399',
      icon: 'Tv',
      description: 'The smart TV or terminal waiting for authorization.'
    },
    {
      id: 'authServer',
      name: 'Authorization Server',
      role: 'Identity Provider',
      color: '#a78bfa',
      icon: 'ShieldCheck',
      description: 'Coordinates device verification and issues tokens.'
    },
    {
      id: 'user',
      name: 'User on Smartphone / PC',
      role: 'Secondary Device with Browser',
      color: '#38bdf8',
      icon: 'Smartphone',
      description: 'User enters the code on their personal phone/laptop.'
    },
    {
      id: 'resourceServer',
      name: 'Resource Server (API)',
      role: 'Streaming / Media API',
      color: '#fbbf24',
      icon: 'Server',
      description: 'Streams videos or data to the authorized device.'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Device Requests Device & User Verification Codes',
      shortTitle: '1. Request Device Code',
      sender: 'device',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'The Smart TV or CLI tool sends a direct POST request to /device/code with its client_id to obtain a user_code, device_code, and verification_uri.',
      whatHappens: [
        'User opens Netflix or YouTube on their Smart TV.',
        'The TV makes an HTTP POST request to the Authorization Server /oauth/v2/device/code.',
        'Auth Server generates two distinct codes: a secret device_code (for the TV) and an 8-character human-friendly user_code (e.g. "WDJB-HGNP").',
        'Auth Server returns the codes along with verification_uri (e.g. "https://provider.com/device") and polling interval (5 seconds).'
      ],
      underTheHood: `Two-Code Separation:
- device_code: High-entropy string kept strictly private by the device.
- user_code: Short, pronounceable string designed for humans to easily type into a phone browser without errors.`,
      securitySpotlight: {
        type: 'info',
        title: 'User-Friendly Security',
        text: 'The user_code avoids confusing characters like 0/O and 1/I/l to prevent typos when users type it into their phone screen.'
      },
      parameters: [
        { name: 'client_id', value: 'smart-tv-lg-oled-2026', required: true, desc: 'Registered device client identifier.' },
        { name: 'scope', value: 'streaming:play account:profile', required: true, desc: 'Permissions the device is requesting.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/device/code',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=smart-tv-lg-oled-2026&scope=streaming%3Aplay%20account%3Aprofile'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          device_code: 'Gmqa_d9128jashd91823ha_secret',
          user_code: 'WDJB-HGNP',
          verification_uri: 'https://provider.com/device',
          verification_uri_complete: 'https://provider.com/device?user_code=WDJB-HGNP',
          expires_in: 900,
          interval: 5
        }, null, 2)
      }
    },
    {
      id: 2,
      title: 'TV Displays Instructions & Starts Polling Auth Server',
      shortTitle: '2. Display Code & Poll',
      sender: 'device',
      receiver: 'user',
      channel: 'front-channel',
      summary: 'The TV displays "Go to https://provider.com/device and enter code WDJB-HGNP" (or scan QR code) on the screen, while polling the Auth Server in the background every 5 seconds.',
      whatHappens: [
        'TV screen renders instructions and a QR code pointing to verification_uri_complete.',
        'Meanwhile, the TV starts polling the /token endpoint in the background: POST /token with grant_type=urn:ietf:params:oauth:grant-type:device_code.',
        'While the user hasn\'t approved yet, Auth Server responds with: {"error": "authorization_pending"}.',
        'TV catches "authorization_pending" and sleeps for interval=5 seconds before retrying.'
      ],
      underTheHood: `Rate Limiting Defense (slow_down):
If the device polls faster than the required interval, the Authorization Server will respond with {"error": "slow_down"}, forcing the device to increase its polling interval by 5 additional seconds.`,
      securitySpotlight: {
        type: 'warning',
        title: 'Preventing DoS with Polling Intervals',
        text: 'The interval parameter prevents millions of smart TVs from bombarding the authorization server simultaneously while waiting for users.'
      },
      parameters: [
        { name: 'device_code', value: 'Gmqa_d9128jashd91823ha_secret', required: true, desc: 'Secret device code TV sends when polling.' },
        { name: 'grant_type', value: 'urn:ietf:params:oauth:grant-type:device_code', required: true, desc: 'RFC 8628 device grant URI.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=smart-tv-lg-oled-2026&device_code=Gmqa_d9128jashd91823ha_secret&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code'
      },
      httpResponse: {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'authorization_pending',
          error_description: 'User has not completed authorization yet. Keep polling.'
        }, null, 2)
      }
    },
    {
      id: 3,
      title: 'User Authorizes on Smartphone / Computer',
      shortTitle: '3. User Approves on Phone',
      sender: 'user',
      receiver: 'authServer',
      channel: 'front-channel',
      summary: 'The user grabs their phone or computer, visits the verification URL, enters or confirms the 8-character code, and consents to pairing the TV.',
      whatHappens: [
        'User opens browser on phone, navigates to https://provider.com/device.',
        'User logs into their account (or is already logged in).',
        'User confirms code WDJB-HGNP matches the TV screen.',
        'Screen asks: "Allow Living Room LG OLED TV to access your account?"',
        'User clicks "Authorize Device".',
        'Auth Server marks the device_code record in its database as APPROVED by the authenticated user.'
      ],
      underTheHood: `Notice that the TV never saw the user's password, 2FA code, or personal browser cookies!
The pairing occurred safely on the user's trusted personal device.`,
      securitySpotlight: {
        type: 'success',
        title: 'Zero Credential Exposure on Public Screens',
        text: 'Entering credentials on a TV screen with a remote control is tedious and exposes passwords to anyone sitting in the room. Device Flow eliminates on-screen credential entry completely.'
      },
      parameters: [
        { name: 'user_code', value: 'WDJB-HGNP', required: true, desc: 'Code typed by user on phone.' },
        { name: 'consent', value: 'approved', required: true, desc: 'User confirmation on phone.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/device/approve',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'user_code=WDJB-HGNP&consent=allow'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html'
        },
        body: '<h1>Success!</h1><p>You may now return to your TV.</p>'
      }
    },
    {
      id: 4,
      title: 'TV Poll Succeeds & Receives Tokens',
      shortTitle: '4. TV Receives Tokens',
      sender: 'device',
      receiver: 'authServer',
      channel: 'back-channel',
      summary: 'On its next 5-second polling tick, the device sends another POST /token request. Since the user has approved the session, the Auth Server responds with HTTP 200 and issues tokens!',
      whatHappens: [
        'TV makes scheduled poll request with device_code.',
        'Auth Server recognizes device_code has been authorized.',
        'Auth Server returns Access Token and Refresh Token.',
        'TV saves tokens in secure device keychain and dismisses the login screen.',
        'TV immediately begins streaming media via the Resource Server!'
      ],
      underTheHood: `The polling loop terminates immediately upon receiving HTTP 200.
The TV can now play 4K movies using the Access Token.`,
      securitySpotlight: {
        type: 'info',
        title: 'Device Keychain Storage',
        text: 'Modern smart TVs and gaming consoles store tokens in hardware-backed secure enclaves (e.g. Apple TV Secure Enclave, Android Keystore).'
      },
      parameters: [
        { name: 'device_code', value: 'Gmqa_d9128jashd91823ha_secret', required: true, desc: 'Device code exchanged for tokens.' }
      ],
      httpRequest: {
        method: 'POST',
        url: 'https://auth.provider.com/oauth/v2/token',
        headers: {
          'Host': 'auth.provider.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=smart-tv-lg-oled-2026&device_code=Gmqa_d9128jashd91823ha_secret&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code'
      },
      httpResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTE4MjM0Iiwic2NvcGUiOiJzdHJlYW1pbmc6cGxheSIsImV4cCI6MTcyNjI4NzIwMH0.tv_stream_tok',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'rfr_tv_long_lived_98471239'
        }, null, 2)
      },
      tokensIssued: {
        hasTokens: true,
        accessToken: {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: {
            sub: 'usr_918234',
            iss: 'https://auth.provider.com',
            aud: 'https://media.provider.com',
            scope: 'streaming:play account:profile',
            exp: 1726287200,
            iat: 1726283600
          }
        }
      }
    }
  ]
};
