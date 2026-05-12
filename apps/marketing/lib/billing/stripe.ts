import {
  type BillingCadence,
  type PlanId,
  getBillingOption,
  getPlan,
  getStripePriceId,
  isBillingCadence,
  isPlanId,
} from "./plans";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

type StripeList<T> = {
  data: T[];
  has_more: boolean;
};

type StripeCustomer = {
  id: string;
  email?: string | null;
};

type StripeCheckoutSession = {
  id: string;
  amount_total?: number | null;
  created: number;
  currency?: string | null;
  customer?: string | null;
  metadata?: Record<string, string> | null;
  mode?: "payment" | "subscription" | "setup" | null;
  payment_status?: "paid" | "unpaid" | "no_payment_required" | null;
  status?: "open" | "complete" | "expired" | null;
  subscription?: string | null;
  url?: string | null;
};

type StripeSubscription = {
  id: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  metadata?: Record<string, string> | null;
  status: string;
};

export type AccountLicense = {
  id: string;
  billingCadence: BillingCadence;
  planId: PlanId;
  planName: string;
  renewsAt?: number;
  source: "checkout" | "subscription";
  status: string;
};

export type AccountPurchase = {
  id: string;
  amount: string;
  billingCadence?: BillingCadence;
  created: number;
  planName?: string;
  status: string;
};

export type AccountBillingSummary = {
  activeLicenses: AccountLicense[];
  configured: boolean;
  customer: StripeCustomer | null;
  error?: string;
  recentPurchases: AccountPurchase[];
};

export class StripeIntegrationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "StripeIntegrationError";
    this.status = status;
  }
}

function getStripeApiKey(): string | null {
  return process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY || null;
}

function stripeHeaders(body?: URLSearchParams): HeadersInit {
  const apiKey = getStripeApiKey();

  if (!apiKey) {
    throw new StripeIntegrationError("Stripe is not configured.", 503);
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
  };
}

function encodeParams(entries: Array<[string, string | undefined]>): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of entries) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params;
}

async function stripeRequest<T>(
  path: string,
  init: { body?: URLSearchParams; method?: "GET" | "POST" } = {}
): Promise<T> {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    body: init.body,
    cache: "no-store",
    headers: stripeHeaders(init.body),
    method: init.method || "GET",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message || `Stripe request failed with ${response.status}.`;
    throw new StripeIntegrationError(message, response.status);
  }

  return payload as T;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeApiKey());
}

export async function findStripeCustomerByEmail(
  email: string
): Promise<StripeCustomer | null> {
  const result = await stripeRequest<StripeList<StripeCustomer>>(
    `/customers?email=${encodeURIComponent(email)}&limit=1`
  );

  return result.data[0] || null;
}

export async function createCheckoutSession(options: {
  billingCadence: BillingCadence;
  email: string;
  origin: string;
  planId: PlanId;
}): Promise<{ id: string; url: string }> {
  const plan = getPlan(options.planId);
  const billing = getBillingOption(options.planId, options.billingCadence);
  const priceId = getStripePriceId(options.planId, options.billingCadence);

  if (!priceId) {
    const envKey = `${plan.id}:${billing.cadence}`;
    throw new StripeIntegrationError(`Missing Stripe price for ${envKey}.`, 503);
  }

  const customer = await findStripeCustomerByEmail(options.email);
  const successUrl = `${options.origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${options.origin}/account?checkout=cancelled&plan=${options.planId}&billing=${options.billingCadence}`;
  const metadata = {
    account_email: options.email,
    billing: billing.cadence,
    plan_id: plan.id,
    plan_name: plan.name,
  };

  const params = encodeParams([
    ["mode", billing.checkoutMode],
    ["success_url", successUrl],
    ["cancel_url", cancelUrl],
    ["client_reference_id", options.email],
    ["line_items[0][price]", priceId],
    ["line_items[0][quantity]", "1"],
    ["allow_promotion_codes", "true"],
    ["metadata[account_email]", metadata.account_email],
    ["metadata[billing]", metadata.billing],
    ["metadata[plan_id]", metadata.plan_id],
    ["metadata[plan_name]", metadata.plan_name],
    ["customer", customer?.id],
    ["customer_email", customer ? undefined : options.email],
  ]);

  if (process.env.STRIPE_AUTOMATIC_TAX === "true") {
    params.set("automatic_tax[enabled]", "true");
  }

  if (billing.checkoutMode === "payment") {
    params.set("customer_creation", "always");
  } else {
    params.set("subscription_data[metadata][account_email]", metadata.account_email);
    params.set("subscription_data[metadata][billing]", metadata.billing);
    params.set("subscription_data[metadata][plan_id]", metadata.plan_id);
    params.set("subscription_data[metadata][plan_name]", metadata.plan_name);
  }

  const session = await stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    body: params,
    method: "POST",
  });

  if (!session.url) {
    throw new StripeIntegrationError("Stripe did not return a Checkout URL.");
  }

  return { id: session.id, url: session.url };
}

async function listCustomerSubscriptions(
  customerId: string
): Promise<StripeSubscription[]> {
  const result = await stripeRequest<StripeList<StripeSubscription>>(
    `/subscriptions?customer=${customerId}&status=all&limit=20`
  );

  return result.data;
}

async function listCustomerCheckoutSessions(
  customerId: string
): Promise<StripeCheckoutSession[]> {
  const result = await stripeRequest<StripeList<StripeCheckoutSession>>(
    `/checkout/sessions?customer=${customerId}&limit=20`
  );

  return result.data;
}

function formatStripeAmount(amount: number | null | undefined, currency?: string | null) {
  if (typeof amount !== "number" || !currency) {
    return "Paid";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount / 100);
}

function metadataPlanId(metadata: Record<string, string> | null | undefined): PlanId | null {
  return isPlanId(metadata?.plan_id) ? metadata.plan_id : null;
}

function metadataBilling(
  metadata: Record<string, string> | null | undefined
): BillingCadence | null {
  return isBillingCadence(metadata?.billing) ? metadata.billing : null;
}

function licenseFromSubscription(
  subscription: StripeSubscription
): AccountLicense | null {
  const planId = metadataPlanId(subscription.metadata);
  const billingCadence = metadataBilling(subscription.metadata);

  if (!planId || !billingCadence) {
    return null;
  }

  if (!["active", "trialing", "past_due"].includes(subscription.status)) {
    return null;
  }

  return {
    id: subscription.id,
    billingCadence,
    planId,
    planName: getPlan(planId).name,
    renewsAt: subscription.current_period_end,
    source: "subscription",
    status: subscription.cancel_at_period_end ? "canceling" : subscription.status,
  };
}

function licenseFromCheckout(session: StripeCheckoutSession): AccountLicense | null {
  const planId = metadataPlanId(session.metadata);
  const billingCadence = metadataBilling(session.metadata);

  if (
    !planId ||
    billingCadence !== "lifetime" ||
    session.mode !== "payment" ||
    session.payment_status !== "paid"
  ) {
    return null;
  }

  return {
    id: session.id,
    billingCadence,
    planId,
    planName: getPlan(planId).name,
    source: "checkout",
    status: "active",
  };
}

function purchaseFromCheckout(session: StripeCheckoutSession): AccountPurchase {
  const planId = metadataPlanId(session.metadata);
  const billingCadence = metadataBilling(session.metadata) || undefined;

  return {
    id: session.id,
    amount: formatStripeAmount(session.amount_total, session.currency),
    billingCadence,
    created: session.created,
    planName: planId ? getPlan(planId).name : undefined,
    status: session.payment_status || session.status || "unknown",
  };
}

export async function getAccountBillingSummary(
  email: string
): Promise<AccountBillingSummary> {
  if (!isStripeConfigured()) {
    return {
      activeLicenses: [],
      configured: false,
      customer: null,
      recentPurchases: [],
    };
  }

  try {
    const customer = await findStripeCustomerByEmail(email);

    if (!customer) {
      return {
        activeLicenses: [],
        configured: true,
        customer: null,
        recentPurchases: [],
      };
    }

    const [subscriptions, checkoutSessions] = await Promise.all([
      listCustomerSubscriptions(customer.id),
      listCustomerCheckoutSessions(customer.id),
    ]);

    const activeLicenses = [
      ...subscriptions.map(licenseFromSubscription),
      ...checkoutSessions.map(licenseFromCheckout),
    ].filter((license): license is AccountLicense => Boolean(license));

    const recentPurchases = checkoutSessions
      .map(purchaseFromCheckout)
      .sort((a, b) => b.created - a.created)
      .slice(0, 5);

    return {
      activeLicenses,
      configured: true,
      customer,
      recentPurchases,
    };
  } catch (error) {
    return {
      activeLicenses: [],
      configured: true,
      customer: null,
      error:
        error instanceof Error
          ? error.message
          : "Stripe account lookup failed.",
      recentPurchases: [],
    };
  }
}

export async function createBillingPortalSession(options: {
  email: string;
  returnUrl: string;
}): Promise<string> {
  const customer = await findStripeCustomerByEmail(options.email);

  if (!customer) {
    throw new StripeIntegrationError("No Stripe customer exists for this account.", 404);
  }

  const params = encodeParams([
    ["customer", customer.id],
    ["return_url", options.returnUrl],
  ]);
  const session = await stripeRequest<{ url?: string | null }>(
    "/billing_portal/sessions",
    {
      body: params,
      method: "POST",
    }
  );

  if (!session.url) {
    throw new StripeIntegrationError("Stripe did not return a portal URL.");
  }

  return session.url;
}
