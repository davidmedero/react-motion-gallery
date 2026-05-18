import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import {
  type BillingCadence,
  type BillingOption,
  billingPlans,
} from "@/lib/billing/plans";
import { checkoutAction } from "@/app/account/actions";
import styles from "./license.module.css";

export const metadata: Metadata = {
  title: "License",
  description:
    "Commercial license options for React Motion Gallery, including single-project and unlimited commercial plans.",
  alternates: { canonical: "/license" },
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

function cadenceLabel(cadence: BillingCadence): string {
  if (cadence === "monthly") {
    return "/month";
  }

  if (cadence === "yearly") {
    return "/year";
  }

  return "one-time";
}

export default function LicensePage() {
  return (
    <main className={styles.pricingPage}>
      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="license-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>License</p>
            <h1 id="license-title">Commercial licenses</h1>
          </div>
        </section>

        <section className={styles.planGrid} aria-label="Commercial license packages">
          {billingPlans.map((plan) => (
            <article
              className={styles.planCard}
              data-featured={
                plan.id === "unlimited-commercial" ? "true" : undefined
              }
              key={plan.id}
            >
              <div className={styles.planHeader}>
                <div>
                  <p className={styles.planEyebrow}>{plan.eyebrow}</p>
                  <h2>{plan.name}</h2>
                </div>
                {plan.id === "unlimited-commercial" ? (
                  <span className={styles.badge}>Best for teams</span>
                ) : null}
              </div>

              <p className={styles.planDescription}>{plan.description}</p>

              <ul className={styles.billingList} aria-label={`${plan.name} license options`}>
                {plan.billing.map((option) => {
                  const annualSavings = getAnnualSavings(plan.billing, option);

                  return (
                    <li className={styles.billingRow} key={option.label}>
                      <form action={checkoutAction} className={styles.billingForm}>
                        <input name="plan" type="hidden" value={plan.id} />
                        <input name="billing" type="hidden" value={option.cadence} />
                        <button className={styles.billingButton} type="submit">
                          <div>
                            <strong>{option.label}</strong>
                            <span>{option.detail}</span>
                            {annualSavings ? (
                              <span className={styles.savingsBadge}>
                                Save {annualSavings} per year
                              </span>
                            ) : null}
                          </div>
                          <p>
                            <span>{option.price}</span>
                            <em>{cadenceLabel(option.cadence)}</em>
                          </p>
                          <ArrowRight aria-hidden="true" />
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>

            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
