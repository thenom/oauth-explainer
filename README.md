# OAuth 2.0 & OpenID Connect (OIDC) Visual Interactive Learning Studio

An interactive, visual learning tool and protocol simulator for OAuth 2.0 and OpenID Connect specifications. Built with React, Vite, and Vanilla CSS to provide an intuitive, step-by-step educational walkthrough of modern authentication and authorization mechanisms in real-time.

![RFCs](https://img.shields.io/badge/RFC-6749%20%7C%207636%20%7C%208628-blue?style=flat-square)
![OAuth 2.1](https://img.shields.io/badge/OAuth-2.1%20Ready-emerald?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-purple?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ⚡ How It Works (At a Glance)

- **100% Client-Side Simulation**: This application is entirely self-contained. It requires **no backend server, no database, and no live credentials**.
- **Zero Outbound API Calls**: All HTTP exchanges, authorization codes, access tokens, and ID tokens are generated and simulated **in-memory in the browser**.
- **Real Cryptographic Verification**: The sandbox and PKCE challenge generators execute real SHA-256 and Base64URL hashing using the browser's native **Web Crypto API** (`crypto.subtle`).
- **Privacy & Air-Gap Friendly**: No telemetry, no analytics, and no token data ever leaves your computer.

---

## 🚀 Quickstart & How to Run

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (bundled with Node.js)

### 1. Clone and Install
```bash
git clone https://github.com/thenom/oauth-explainer.git
cd oauth-explainer
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 3. Production Build & Local Preview
To compile the static production bundle and test the built output locally:
```bash
npm run build      # Generates minified static bundle in dist/
npm run preview    # Serves the production build locally
```

### 4. Code Quality & Linting
Run the fast zero-warning static analyzer:
```bash
npm run lint       # Runs oxlint across all JS/JSX files
```

---

## 🌟 Interactive Studio Features

### 1. Multi-Actor Interactive Swimlane Diagram
Visualizes the 4 distinct roles defined in RFC 6749:
- **Resource Owner** (End User / Browser)
- **Client Application** (SPA / Mobile App / Confidential Web Server)
- **Authorization Server** (Identity Provider / IdP)
- **Resource Server** (Protected API / UserInfo Endpoint)
- **Animated SVG Packet Motion**: Dynamic traveling packet illustrates the HTTP method (`GET`, `POST`, `302 REDIRECT`) between sender and receiver.
- **Front-Channel vs Back-Channel Badge**: Highlights whether messages travel through the public browser URL bar (front-channel) or encrypted direct server HTTPS (back-channel).

### 2. Dynamic Identity Provider Presets
Switching the **Provider Preset** in the top hero banner dynamically adapts the entire walkthrough:
- **Standard OAuth 2.0 / OIDC** (Generic RFC baseline)
- **Google Identity (OpenID Connect)** (`accounts.google.com`, Google scopes, userinfo attributes)
- **GitHub OAuth Apps** (`github.com/login/oauth`, repository scopes, octocat profile responses)
- **Auth0 / Okta Customer Identity** (Tenant URLs, audience parameters, RBAC scopes)

### 3. Interactive Flow Decision Wizard ("Which Flow Should I Use?")
Click **Flow Decision Guide** in the header to launch an interactive 3-step diagnostic wizard:
1. Client application architecture (SPA vs Server vs Mobile vs Microservice vs Smart TV/CLI)
2. Client secret storage capability (Public vs Confidential client)
3. Delegation vs Identity requirements (OAuth 2.0 API access vs OIDC user authentication)
- **Instant Result**: Recommends the exact RFC flow with security rationale, RFC citations, and a one-click **"Load this Flow in Studio"** button.

### 4. Live Security & Attack Simulation Sandbox
Click **Attack & Tamper Sandbox** to test defensive mechanisms against real-world vulnerabilities:
- **PKCE Code Interception (RFC 7636)**: Inject an attacker's guessed `code_verifier`, observe live `Base64URL(SHA-256(verifier))` computation, and see the Auth Server reject with `HTTP 400 invalid_grant`.
- **CSRF State Tampering (RFC 6749 §10.12)**: Modify the returned `state` parameter and observe client-side rejection before any token exchange.
- **Redirect URI Tampering**: Test URI whitelist enforcement against open redirectors.
- **OIDC Token Replay**: Test session `nonce` matching against injected tokens.

### 5. Live Protocol Inspector & Custom JWT Playground
- **HTTP Request**: Method, highlighted query parameters, headers, and request bodies.
- **HTTP Response**: Status badges (`200 OK`, `302 Found`, `401 Unauthorized`), response headers, and payloads.
- **Terminal cURL Equivalent**: Copy-paste ready `curl` command for backend steps.
- **Decoded Tokens (JWT)**: Visual 3-part JOSE breakdown (Header in red, Payload in purple, Signature in cyan).
- **Custom JWT Playground**: Paste any external compact JWT or select sample provider tokens to decode claims, expiration countdowns, and subjects in real-time.

### 6. Supported OAuth 2.0 & OIDC Flows
1. **Authorization Code Flow with PKCE** *(RFC 7636 + RFC 6749 — Modern Gold Standard for SPAs & Mobile)*
2. **Authorization Code Flow (Confidential Server-Side)** *(Traditional Web Servers with client secrets)*
3. **Client Credentials Flow** *(Machine-to-Machine / Daemons / Microservices)*
4. **Refresh Token Flow** *(Renewing expired tokens with Refresh Token Rotation)*
5. **Device Authorization Flow** *(Smart TVs, CLI Tools, IoT — RFC 8628)*
6. **Implicit Flow (Deprecated)** *(Specifically highlights security risks and why OAuth 2.1 disallows it)*

### 7. Searchable RFC Glossary
Click **RFC Glossary** for an instant searchable dictionary covering OAuth 2.0 & OIDC specifications, parameters, grant types, and security terminology with direct RFC citations.

---

## ⌨️ Keyboard Shortcuts
| Key | Action |
| :--- | :--- |
| **Right Arrow (`→`)** | Step Forward / Next Step |
| **Left Arrow (`←`)** | Step Backward / Previous Step |
| **Spacebar** | Toggle Auto-Play / Pause |

---

## 📁 Repository Structure

```
oauth-explainer/
├── index.html                   # HTML entry point with metadata and favicon
├── package.json                 # Project dependencies and npm scripts
├── vite.config.js               # Vite build configuration
├── src/
│   ├── main.jsx                 # React root renderer
│   ├── App.jsx                  # Main application state machine & coordinator
│   ├── index.css                # Design system tokens, color palettes & typography
│   ├── components/
│   │   ├── Header.jsx           # Top branding, flow selector, and modal triggers
│   │   ├── FlowControls.jsx     # Stepper pills, next/prev, autoplay, speed toggle
│   │   ├── FlowDiagram.jsx      # SVG swimlane diagram with animated traveling packets
│   │   ├── FlowDecisionModal.jsx# Interactive "Which Flow Should I Use?" wizard
│   │   ├── StepExplainer.jsx    # "What happens", mechanics, security spotlights
│   │   ├── HttpInspector.jsx    # Request/Response panels, cURL generator, JWT tab
│   │   ├── TokenInspector.jsx   # 3-part JOSE JWT decoder & Custom JWT Playground
│   │   ├── ParameterSandbox.jsx # Live attack testing with Web Crypto SHA-256
│   │   └── GlossaryModal.jsx    # Searchable RFC definitions dictionary
│   ├── data/
│   │   ├── flows/               # Definitions for all 6 OAuth/OIDC flows
│   │   │   ├── authCodePkce.js
│   │   │   ├── authCodeSecret.js
│   │   │   ├── clientCredentials.js
│   │   │   ├── refreshToken.js
│   │   │   ├── deviceFlow.js
│   │   │   ├── implicitFlow.js
│   │   │   ├── index.js
│   │   │   └── presetAdapter.js # Dynamic Google/GitHub/Auth0 preset interpolator
│   │   └── glossary.js          # RFC terminology database
│   └── styles/                  # Modular Vanilla CSS stylesheets
```

---

## 📚 Standards & RFC References
- **RFC 6749**: The OAuth 2.0 Authorization Framework
- **RFC 6750**: Bearer Token Usage
- **RFC 7636**: Proof Key for Code Exchange (PKCE)
- **RFC 8628**: OAuth 2.0 Device Authorization Grant
- **OIDC Core 1.0**: OpenID Connect Core 1.0
- **OAuth 2.0 Security BCP**: OAuth 2.0 Security Best Current Practice

---

## 📄 License
MIT
