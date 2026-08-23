# Contact Me — Frontend

Responsive web + mobile-web prototype for **Contact Me** (`www.thecontact.me`), built from the supplied landing-page and application wireframes.

## Included screens

- `/` — high-fidelity landing page
- `/sign-up` — account creation prototype
- `/sign-in` — login prototype
- `/onboarding/username` — choose the public username / link
- `/app` — conversation inbox
- `/app/new` — new conversation / contact search
- `/app/chat/[id]` — responsive chat screen with local message sending
- `/app/profile` — profile + share/copy personal link
- `/app/settings` — notifications and privacy settings
- `/app/favorites`, `/app/archived`, `/app/groups`, `/app/requests` — navigation-ready placeholders

All initial application data comes from `src/lib/mock-data.ts`.

## Important authentication decision

The e-mail confirmation screen from the early wireframe was intentionally **not implemented**. The current sign-up/sign-in form is only a local prototype so the project runs without external credentials. When Clerk is integrated, Clerk should own sign-up, login, e-mail verification and session protection.

Recommended Clerk flow:

1. Replace `/sign-up` and `/sign-in` prototype forms with Clerk components or Clerk Elements.
2. Redirect a newly created user to `/onboarding/username` after Clerk finishes verification.
3. Protect `/app/**` and `/onboarding/**` using Clerk middleware/proxy.
4. Persist the chosen username in the backend and/or Clerk public metadata according to the backend architecture.

`.env.example` already reserves the standard Clerk environment variables.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## UI notes

- Responsive break point optimized for desktop and mobile web.
- The supplied SVG logo is copied unchanged to `public/contact-me-logo.svg` and reused across the screens.
- Chat, profile, settings, search, copy-link and mock auth interactions are client-side prototype behavior.
- No backend/API calls are present yet.
