This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Billing Environment

Stripe recommends restricted API keys for server-side integrations. Set
`STRIPE_API_KEY` to a restricted key (`rk_test_` or `rk_live_`) rather than an
unrestricted secret key. The app still accepts `STRIPE_SECRET_KEY` as a legacy
fallback.

This app currently calls these Stripe endpoints:

- `GET /v1/customers`
- `POST /v1/checkout/sessions`
- `GET /v1/subscriptions`
- `GET /v1/checkout/sessions`
- `POST /v1/billing_portal/sessions`

Create and test a sandbox restricted key with read/write permissions that match
those endpoints, then mirror the same permissions for the live restricted key.
Keep `STRIPE_WEBHOOK_SECRET` separate; webhook signing secrets are not API keys.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
