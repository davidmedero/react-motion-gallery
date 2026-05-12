"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import {
  clearSessionCookie,
  createMagicLinkToken,
  getSession,
  parseEmail,
} from "@/lib/auth/session";
import {
  getBillingCadenceOrDefault,
  getPlanIdOrDefault,
} from "@/lib/billing/plans";
import {
  StripeIntegrationError,
  createBillingPortalSession,
  createCheckoutSession,
} from "@/lib/billing/stripe";

function firstString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function accountPath(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `/account?${query}` : "/account";
}

async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  const origin = requestHeaders.get("origin");

  if (origin) {
    return origin;
  }

  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";

  return `${protocol}://${host}`;
}

export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const email = parseEmail(formData.get("email"));
  const plan = getPlanIdOrDefault(firstString(formData.get("plan")));
  const billing = getBillingCadenceOrDefault(firstString(formData.get("billing")));

  if (!email) {
    redirect(accountPath({ auth: "invalid-email", billing, plan }));
  }

  const origin = await getOrigin();
  const token = createMagicLinkToken({ billing, email, plan });
  const magicLink = `${origin}/account/verify?token=${encodeURIComponent(token)}`;
  let devMagicLink: string | undefined;
  let authStatus = "link-sent";

  try {
    const result = await sendMagicLinkEmail({ email, magicLink });
    authStatus = result.delivered ? "link-sent" : "dev-link";
    devMagicLink = result.delivered ? undefined : magicLink;
  } catch (error) {
    console.error(error);
    redirect(accountPath({ auth: "email-failed", billing, plan }));
  }

  redirect(
    accountPath({
      auth: authStatus,
      billing,
      dev_magic_link: devMagicLink,
      plan,
    })
  );
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(accountPath({ auth: "signed-out" }));
}

export async function checkoutAction(formData: FormData): Promise<void> {
  const session = await getSession();
  const plan = getPlanIdOrDefault(firstString(formData.get("plan")));
  const billing = getBillingCadenceOrDefault(firstString(formData.get("billing")));

  if (!session) {
    redirect(accountPath({ auth: "required", billing, plan }));
  }

  let checkoutUrl: string;

  try {
    const checkout = await createCheckoutSession({
      billingCadence: billing,
      email: session.email,
      origin: await getOrigin(),
      planId: plan,
    });
    checkoutUrl = checkout.url;
  } catch (error) {
    console.error(error);
    const reason =
      error instanceof StripeIntegrationError && error.status === 503
        ? "stripe-not-configured"
        : "checkout-failed";

    redirect(accountPath({ billing, error: reason, plan }));
  }

  redirect(checkoutUrl);
}

export async function billingPortalAction(): Promise<void> {
  const session = await getSession();

  if (!session) {
    redirect(accountPath({ auth: "required" }));
  }

  let portalUrl: string;

  try {
    const origin = await getOrigin();
    portalUrl = await createBillingPortalSession({
      email: session.email,
      returnUrl: `${origin}/account`,
    });
  } catch (error) {
    console.error(error);
    const reason =
      error instanceof StripeIntegrationError && error.status === 503
        ? "stripe-not-configured"
        : "portal-failed";

    redirect(accountPath({ error: reason }));
  }

  redirect(portalUrl);
}
