import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Commercial license pricing for React Motion Gallery, including single-project and unlimited commercial plans.",
  alternates: { canonical: "/pricing" },
};

type BillingOption = {
  label: string;
  price: string;
  cadence: string;
  note: string;
};

type Plan = {
  name: string;
  eyebrow: string;
  description: string;
  href: string;
  featured?: boolean;
  billing: BillingOption[];
  features: string[];
};

function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}

function getAnnualSavings(
  billing: BillingOption[],
  option: BillingOption
): string | null {
  if (option.label !== "Yearly") {
    return null;
  }

  const monthly = billing.find((item) => item.label === "Monthly");

  if (!monthly) {
    return null;
  }

  const savings = priceToNumber(monthly.price) * 12 - priceToNumber(option.price);

  if (savings <= 0) {
    return null;
  }

  return `$${savings.toLocaleString("en-US")}`;
}

const plans: Plan[] = [
  {
    name: "Single Commercial",
    eyebrow: "One commercial build",
    description:
      "For a single product, portfolio, client site, or commercial application.",
    href: "/account?plan=single-commercial",
    billing: [
      {
        label: "Monthly",
        price: "$19",
        cadence: "/month",
        note: "Flexible monthly billing",
      },
      {
        label: "Yearly",
        price: "$149",
        cadence: "/year",
        note: "Renew annually",
      },
      {
        label: "Lifetime",
        price: "$299",
        cadence: "lifetime unlimited",
        note: "One-time purchase",
      },
    ],
    features: [
      "Commercial use for one project",
    ],
  },
  {
    name: "Unlimited Commercial",
    eyebrow: "Unlimited commercial builds",
    description:
      "For agencies, studios, and product teams using React Motion Gallery across many commercial projects.",
    href: "/account?plan=unlimited-commercial",
    featured: true,
    billing: [
      {
        label: "Monthly",
        price: "$59",
        cadence: "/month",
        note: "Flexible monthly billing",
      },
      {
        label: "Yearly",
        price: "$599",
        cadence: "/year",
        note: "Renew annually",
      },
      {
        label: "Lifetime",
        price: "$999",
        cadence: "lifetime unlimited",
        note: "One-time purchase",
      },
    ],
    features: [
      "Commercial use across unlimited projects",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className={styles.pricingPage}>
      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="pricing-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Pricing</p>
            <h1 id="pricing-title">Commercial licenses</h1>
          </div>
        </section>

        <section className={styles.planGrid} aria-label="Commercial plans">
          {plans.map((plan) => (
            <article
              className={styles.planCard}
              data-featured={plan.featured ? "true" : undefined}
              key={plan.name}
            >
              <div className={styles.planHeader}>
                <div>
                  <p className={styles.planEyebrow}>{plan.eyebrow}</p>
                  <h2>{plan.name}</h2>
                </div>
                {plan.featured ? (
                  <span className={styles.badge}>Best for teams</span>
                ) : null}
              </div>

              <p className={styles.planDescription}>{plan.description}</p>

              <ul className={styles.billingList} aria-label={`${plan.name} pricing`}>
                {plan.billing.map((option) => {
                  const annualSavings = getAnnualSavings(plan.billing, option);

                  return (
                    <li className={styles.billingRow} key={option.label}>
                      <div>
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                        {annualSavings ? (
                          <span className={styles.savingsBadge}>
                            Save {annualSavings} per year
                          </span>
                        ) : null}
                      </div>
                      <p>
                        <span>{option.price}</span>
                        <em>{option.cadence}</em>
                      </p>
                    </li>
                  );
                })}
              </ul>

              <ul className={styles.featureList}>
              </ul>

              <Link className={styles.cta} href={plan.href}>
                Choose {plan.name}
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
