# Contact Me — Frontend

Responsive web + mobile-web frontend for **Contact Me** (`www.thecontact.me`) integrated with `contactme-back`.

## Stack

- Next.js 16 / App Router
- React 19 / TypeScript
- Clerk authentication
- REST integration with Spring Boot
- STOMP over WebSocket for realtime messages, typing and receipts
- Web Crypto API for browser-side E2EE
- IndexedDB for the local device private key and conversation-key cache

## Implemented integration

- Clerk `<SignIn />` and `<SignUp />`; Clerk owns e-mail verification.
- `src/proxy.ts` protects `/app/**` and `/onboarding/**`.
- Backend profile is created lazily from the Clerk JWT subject and synchronized with Clerk name/avatar on first load.
- Username availability + profile persistence.
- Browser device registration with RSA-OAEP public key; private key never leaves the browser.
- Live conversations, favorites, archived, groups and requests from PostgreSQL through the backend.
- User search and direct-conversation creation.
- Request acceptance/decline.
- AES-256-GCM message encryption/decryption in the browser.
- Conversation AES keys wrapped per device with RSA-OAEP SHA-256 and persisted only as encrypted envelopes.
- Realtime STOMP connection authenticated with the Clerk session token.
- REST history/reconnect synchronization and REST fallback when WebSocket is unavailable.
- Device list/revocation in Settings.
- Public `/{username}` Contact Me page backed by `/api/v1/public/users/{username}`.

## Environment

```bash
cp .env.example .env.local
```

Fill in your Clerk credentials. For local integration, the backend defaults are:

```env
NEXT_PUBLIC_CONTACTME_API_URL=http://localhost:8080
NEXT_PUBLIC_CONTACTME_WS_URL=ws://localhost:8080/ws
```

The backend must allow the frontend origin, for example:

```env
FRONTEND_ORIGINS=http://localhost:3000
```

Configure the backend with the same Clerk instance (`CLERK_ISSUER_URI` / `CLERK_JWK_SET_URI`).

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## E2EE note

The implementation establishes the intended architecture boundary: plaintext and private keys remain in the browser, while the backend stores ciphertext and encrypted conversation-key envelopes. It is suitable for the project MVP/architecture validation, but a production messenger should move to an audited messaging protocol/library with identity verification, forward secrecy, post-compromise security, robust key rotation and recovery.
