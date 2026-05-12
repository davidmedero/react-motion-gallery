export const billingCadences = ["monthly", "yearly", "lifetime"] as const;

export type BillingCadence = (typeof billingCadences)[number];

export type BillingOption = {
  cadence: BillingCadence;
  label: string;
  price: string;
  detail: string;
  checkoutMode: "payment" | "subscription";
};

export type BillingPlan = {
  id: "single-commercial" | "unlimited-commercial";
  name: string;
  eyebrow: string;
  description: string;
  licenseScope: string;
  billing: BillingOption[];
};

export type PlanId = BillingPlan["id"];

export const billingPlans: BillingPlan[] = [
  {
    id: "single-commercial",
    name: "Single Commercial",
    eyebrow: "One commercial build",
    description:
      "For one product, portfolio, client site, or commercial application.",
    licenseScope: "Commercial use for one production project",
    billing: [
      {
        cadence: "monthly",
        label: "Monthly",
        price: "$19",
        detail: "Flexible monthly billing",
        checkoutMode: "subscription",
      },
      {
        cadence: "yearly",
        label: "Yearly",
        price: "$149",
        detail: "Renew annually",
        checkoutMode: "subscription",
      },
      {
        cadence: "lifetime",
        label: "Lifetime",
        price: "$299",
        detail: "One-time purchase",
        checkoutMode: "payment",
      },
    ],
  },
  {
    id: "unlimited-commercial",
    name: "Unlimited Commercial",
    eyebrow: "Unlimited commercial builds",
    description:
      "For agencies, studios, and product teams using React Motion Gallery across many projects.",
    licenseScope: "Commercial use across unlimited projects",
    billing: [
      {
        cadence: "monthly",
        label: "Monthly",
        price: "$59",
        detail: "Flexible monthly billing",
        checkoutMode: "subscription",
      },
      {
        cadence: "yearly",
        label: "Yearly",
        price: "$599",
        detail: "Renew annually",
        checkoutMode: "subscription",
      },
      {
        cadence: "lifetime",
        label: "Lifetime",
        price: "$999",
        detail: "One-time purchase",
        checkoutMode: "payment",
      },
    ],
  },
];

export const stripePriceEnvKeys: Record<PlanId, Record<BillingCadence, string>> = {
  "single-commercial": {
    monthly: "STRIPE_PRICE_SINGLE_COMMERCIAL_MONTHLY",
    yearly: "STRIPE_PRICE_SINGLE_COMMERCIAL_YEARLY",
    lifetime: "STRIPE_PRICE_SINGLE_COMMERCIAL_LIFETIME",
  },
  "unlimited-commercial": {
    monthly: "STRIPE_PRICE_UNLIMITED_COMMERCIAL_MONTHLY",
    yearly: "STRIPE_PRICE_UNLIMITED_COMMERCIAL_YEARLY",
    lifetime: "STRIPE_PRICE_UNLIMITED_COMMERCIAL_LIFETIME",
  },
};

export function isPlanId(value: string | undefined): value is PlanId {
  return value === "single-commercial" || value === "unlimited-commercial";
}

export function isBillingCadence(
  value: string | undefined
): value is BillingCadence {
  return value === "monthly" || value === "yearly" || value === "lifetime";
}

export function getPlan(planId: PlanId): BillingPlan {
  return billingPlans.find((plan) => plan.id === planId) || billingPlans[0];
}

export function getBillingOption(
  planId: PlanId,
  cadence: BillingCadence
): BillingOption {
  const plan = getPlan(planId);
  return plan.billing.find((option) => option.cadence === cadence) || plan.billing[1];
}

export function getPlanIdOrDefault(value: string | undefined): PlanId {
  return isPlanId(value) ? value : "single-commercial";
}

export function getBillingCadenceOrDefault(
  value: string | undefined
): BillingCadence {
  return isBillingCadence(value) ? value : "yearly";
}

export function getStripePriceId(
  planId: PlanId,
  cadence: BillingCadence
): string | null {
  const envKey = stripePriceEnvKeys[planId][cadence];
  return process.env[envKey] || null;
}
