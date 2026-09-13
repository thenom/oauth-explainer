# OAuth 2.0 & OpenID Connect (OIDC) Visual Interactive Learning Studio

An interactive, visual learning tool and protocol simulator for OAuth 2.0 and OpenID Connect specifications. Built with React, Vite, and Vanilla CSS to provide an intuitive, step-by-step educational walkthrough of how modern authentication and authorization mechanisms function in real-time.

![OAuth Learning Studio](https://img.shields.io/badge/RFC-6749%20%7C%207636%20%7C%208628-blue?style=flat-square)
![OAuth 2.1](https://img.shields.io/badge/OAuth-2.1%20Ready-emerald?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🌟 Key Features

### 1. Multi-Actor Interactive Process Flow Diagram
- **Live Swimlanes & Actors**: Visualizes the 4 distinct roles defined in RFC 6749:
  - **Resource Owner** (End User / Browser)
  - **Client Application** (SPA / Mobile App / Confidential Web Server)
  - **Authorization Server** (Identity Provider / IdP)
  - **Resource Server** (Protected API / UserInfo Endpoint)
- **Animated Packet Motion**: Watch dynamic SVG message packets travel across directed paths between sender and receiver actors at each step.
- **Front-Channel vs Back-Channel Indicator**: Highlights whether a message flows through the user's browser URL bar (front-channel) or direct encrypted server-to-server TLS (back-channel).

### 2. Comprehensive "What Happens At This Step" Explanations
- **Step Summary**: Clear, plain-English overview of the action occurring.
- **Sequence of Events**: Itemized breakdown of what client and server are processing.
- **Under the Hood**: Deep-dive protocol mechanics, SHA-256 derivation formulas, and redirect handling.
- **Security Spotlight**: Real-world security analysis (e.g. CSRF prevention via `state`, code interception defense via `PKCE`, token leakage prevention).
- **Key Parameters Breakdown**: Interactive parameter chips with descriptions, requirement flags, and example values.

### 3. Live Protocol & HTTP Inspector
- **HTTP Request**: Method badges, highlighted query parameters, headers, and request bodies.
- **HTTP Response**: Status badges (`200 OK`, `302 Found`, `401 Unauthorized`), response headers, and bodies.
- **Terminal cURL Equivalent**: Generates copy-paste ready `curl` commands for backend steps.
- **JWT Token Inspector**: Decodes issued tokens (Access Token & ID Token) into 3-part JOSE format (Header, Payload Claims, and Signature).

### 4. Interactive Security & Attack Simulation Sandbox
- **CSRF Attack Simulation**: Tamper with the returned `state` parameter and observe client-side rejection.
- **PKCE Code Interception**: Tamper with `code_verifier` and watch the Auth Server reject with `invalid_grant`.
- **Redirect URI Tampering**: Observe how the Auth Server strictly enforces registered callback domains.
- **Token Replay Attack**: See how OpenID Connect `nonce` claims prevent token injection into unauthorized sessions.

### 5. Supported OAuth 2.0 & OIDC Flows
1. **Authorization Code Flow with PKCE** *(RFC 7636 + RFC 6749 - Modern Gold Standard)*
2. **Authorization Code Flow (Confidential Server-Side)** *(Traditional Web Servers)*
3. **Client Credentials Flow** *(Machine-to-Machine / Microservices)*
4. **Refresh Token Flow** *(Renewing expired tokens with Refresh Token Rotation)*
5. **Device Authorization Flow** *(Smart TVs, CLI Tools, IoT - RFC 8628)*
6. **Implicit Flow (Deprecated)** *(Explaining vulnerabilities and why OAuth 2.1 disallows it)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/thenom/oauth-explainer.git
cd oauth-explainer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Building for Production
```bash
npm run build
```

---

## 📚 Standards & RFC References
- **RFC 6749**: The OAuth 2.0 Authorization Framework
- **RFC 6750**: The OAuth 2.0 Authorization Framework: Bearer Token Usage
- **RFC 7636**: Proof Key for Code Exchange by OAuth Public Clients (PKCE)
- **RFC 8628**: OAuth 2.0 Device Authorization Grant
- **OIDC Core 1.0**: OpenID Connect Core 1.0 incorporating errata set 1
- **OAuth 2.0 Security BCP**: OAuth 2.0 Security Best Current Practice

---

## ⌨️ Keyboard Shortcuts
- **Right Arrow (`→`)**: Next Step
- **Left Arrow (`←`)**: Previous Step
- **Spacebar**: Toggle Auto-Play / Pause

---

## 📄 License
MIT
