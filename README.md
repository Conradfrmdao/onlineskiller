# OnlineSkiller

OnlineSkiller is a subscription SaaS for creators who want to launch a digital product, course, coaching program, service, workshop, template pack, or community page and promote it with practical marketing resources.

## Stack

- Next.js 16 App Router and React 19
- Strict TypeScript
- Tailwind CSS 4 and shadcn-style primitives
- Clerk authentication
- Neon/PostgreSQL and Drizzle ORM
- Mock billing or Pesapal API 3.0
- Zod validation and Vitest

## Local setup

1. Copy `.env.example` to `.env.local` and provide Clerk and Postgres values.
2. Install dependencies with `npm install`.
3. Push the schema with `npm run db:push`.
4. Seed templates and marketing content with `npm run db:seed`.
5. Start the app with `npm run dev`.

`BILLING_PROVIDER=mock` completes checkout through the server callback without collecting money. Use it for local development.

## Pesapal setup

1. Set `BILLING_PROVIDER=pesapal`.
2. Set the environment, consumer key, and consumer secret.
3. Deploy to a public HTTPS URL and set `NEXT_PUBLIC_APP_URL`.
4. Run `npm run pesapal:register-ipn`.
5. Put the printed value into `PESAPAL_IPN_ID`.

Every callback and IPN is verified against Pesapal transaction status before a subscription is activated. Recurring checkout is optional and limited to card methods supported by Pesapal.

## Verification

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run check:config
```

`npm run check:services` additionally connects to PostgreSQL, Clerk, and Pesapal when configured.

## Administration

Set `ADMIN_CLERK_USER_ID` to one or more comma-separated Clerk user IDs, set a user role to `admin` in the database, or provide `role=admin` through Clerk metadata. Admin routes support user roles, page moderation, content management, subscription overrides, and platform settings.
