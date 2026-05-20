import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { canAccessCustomerBilling, getSession } from "@/lib/auth/session";
import {
  type BillingCadence,
  type PlanId,
  getBillingOption,
  getPlan,
  isBillingCadence,
  isPlanId,
  stripePriceEnvKeys,
} from "@/lib/billing/plans";
import {
  type AccountBillingSummary,
  getAccountBillingSummary,
} from "@/lib/billing/stripe";
import {
  billingPortalAction,
  checkoutAction,
  requestMagicLinkAction,
  signOutAction,
} from "./actions";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage your React Motion Gallery account, licenses, and commercial billing.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: true },
};

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

type PurchaseIntent = {
  selectedBilling: BillingCadence;
  selectedPlanId: PlanId;
};

function getPurchaseIntent(
  params: Record<string, string | string[] | undefined>
): PurchaseIntent | null {
  const plan = firstParam(params, "plan");
  const billing = firstParam(params, "billing");

  if (!isPlanId(plan) || !isBillingCadence(billing)) {
    return null;
  }

  return {
    selectedBilling: billing,
    selectedPlanId: plan,
  };
}

function formatUnixDate(timestamp: number | undefined): string | null {
  if (!timestamp) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

function accountNotice(params: Record<string, string | string[] | undefined>) {
  const auth = firstParam(params, "auth");
  const checkout = firstParam(params, "checkout");
  const error = firstParam(params, "error");

  if (checkout === "success") {
    return {
      tone: "success" as const,
      text: "Checkout completed. Your Stripe customer record may take a moment to appear below.",
    };
  }

  if (checkout === "cancelled") {
    return {
      tone: "neutral" as const,
      text: "Checkout was cancelled. Your selected license is still ready when you are.",
    };
  }

  if (auth === "invalid-email") {
    return {
      tone: "warning" as const,
      text: "Enter a valid email address to continue.",
    };
  }

  if (auth === "required") {
    return {
      tone: "warning" as const,
      text: "Sign in with a magic link before continuing to checkout.",
    };
  }

  if (auth === "link-sent") {
    return {
      tone: "success" as const,
      text: "Check your email for a sign-in link.",
    };
  }

  if (auth === "dev-link") {
    return {
      tone: "success" as const,
      text: "Development magic link generated.",
    };
  }

  if (auth === "email-failed") {
    return {
      tone: "warning" as const,
      text: "The sign-in email could not be sent.",
    };
  }

  if (auth === "magic-invalid") {
    return {
      tone: "warning" as const,
      text: "That sign-in link is invalid or expired.",
    };
  }

  if (auth === "signed-in") {
    return {
      tone: "success" as const,
      text: "You are signed in.",
    };
  }

  if (auth === "signed-out") {
    return {
      tone: "neutral" as const,
      text: "You are signed out.",
    };
  }

  if (error === "stripe-not-configured") {
    return {
      tone: "warning" as const,
      text: "Stripe is not configured yet. Add the account and price environment variables, then try again.",
    };
  }

  if (error === "portal-failed") {
    return {
      tone: "warning" as const,
      text: "The billing portal could not be opened for this account.",
    };
  }

  if (error === "checkout-failed") {
    return {
      tone: "warning" as const,
      text: "Checkout could not be created. Check the Stripe configuration and price IDs.",
    };
  }

  return null;
}

function PurchaseConfirmationPanel(props: {
  purchaseIntent: PurchaseIntent;
  signedIn: boolean;
}) {
  const plan = getPlan(props.purchaseIntent.selectedPlanId);
  const option = getBillingOption(plan.id, props.purchaseIntent.selectedBilling);

  return (
    <section className={styles.panel} aria-labelledby="package-title">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>Package</p>
          <h2 id="package-title">Selected license</h2>
        </div>
        <CreditCard aria-hidden="true" />
      </div>

      <div className={styles.checkoutSummary}>
        <div>
          <span>Selected package</span>
          <strong>
            {plan.name} - {option.label}
          </strong>
          <small>
            {option.price} - {option.detail}
          </small>
        </div>
        {props.signedIn ? (
          <form action={checkoutAction}>
            <input name="plan" type="hidden" value={plan.id} />
            <input name="billing" type="hidden" value={option.cadence} />
            <button className={styles.primaryButton} type="submit">
              Continue to checkout
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        ) : (
          <a className={styles.secondaryButton} href="#account-email">
            Sign in to checkout
            <ArrowRight aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}

function SignedOutPanel(props: { purchaseIntent: PurchaseIntent | null }) {
  return (
    <section className={styles.panel} aria-labelledby="signin-title">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>Sign in</p>
          <h2 id="signin-title">Use your purchase email</h2>
        </div>
        <KeyRound aria-hidden="true" />
      </div>

      <form action={requestMagicLinkAction} className={styles.signInForm}>
        {props.purchaseIntent ? (
          <>
            <input
              name="plan"
              type="hidden"
              value={props.purchaseIntent.selectedPlanId}
            />
            <input
              name="billing"
              type="hidden"
              value={props.purchaseIntent.selectedBilling}
            />
          </>
        ) : null}
        <label htmlFor="account-email">Email</label>
        <div className={styles.emailRow}>
          <input
            autoComplete="email"
            id="account-email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <button className={styles.primaryButton} type="submit">
            Send magic link
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}

function SetupChecklist() {
  const priceEnvKeys = Object.values(stripePriceEnvKeys).flatMap((cadences) =>
    Object.values(cadences)
  );

  return (
    <div className={styles.setupList}>
      <span>
        <code>AUTH_SECRET</code>
      </span>
      <span>
        <code>STRIPE_API_KEY</code>
      </span>
      <span>
        <code>STRIPE_WEBHOOK_SECRET</code>
      </span>
      {priceEnvKeys.map((envKey) => (
        <span key={envKey}>
          <code>{envKey}</code>
        </span>
      ))}
    </div>
  );
}

function AccountStatusPanel(props: {
  billingAccessEnabled: boolean;
  email: string;
  summary: AccountBillingSummary | null;
}) {
  return (
    <section className={styles.panel} aria-labelledby="account-status-title">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>Status</p>
          <h2 id="account-status-title">Account access</h2>
        </div>
        <ShieldCheck aria-hidden="true" />
      </div>

      <div className={styles.identityBlock}>
        <span>Signed in as</span>
        <strong>{props.email}</strong>
      </div>

      {!props.billingAccessEnabled ? (
        <div className={styles.emptyState}>
          <strong>Magic link needed</strong>
          <p>
            Use a magic link to unlock billing history and portal access.
          </p>
        </div>
      ) : props.summary && !props.summary.configured ? (
        <div className={styles.emptyState}>
          <strong>Stripe setup needed</strong>
          <p>Add these environment variables before checkout and billing status can run.</p>
          <SetupChecklist />
        </div>
      ) : props.summary?.error ? (
        <div className={styles.emptyState}>
          <strong>Stripe lookup failed</strong>
          <p>{props.summary.error}</p>
        </div>
      ) : props.summary && props.summary.activeLicenses.length > 0 ? (
        <div className={styles.licenseList}>
          {props.summary.activeLicenses.map((license) => {
            const renewsAt = formatUnixDate(license.renewsAt);

            return (
              <div className={styles.licenseRow} key={license.id}>
                <div>
                  <strong>{license.planName}</strong>
                  <span>
                    {getBillingOption(license.planId, license.billingCadence).label} -{" "}
                    {license.status}
                  </span>
                </div>
                <small>
                  {license.source === "checkout"
                    ? "Lifetime"
                    : renewsAt
                      ? `Renews ${renewsAt}`
                      : "Subscription"}
                </small>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <strong>No active license</strong>
          <p>View license options to start a subscription or buy lifetime access.</p>
        </div>
      )}

      {props.summary?.customer ? (
        <form action={billingPortalAction}>
          <button className={styles.secondaryButton} type="submit">
            Manage billing
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      ) : null}
    </section>
  );
}

function RecentPurchasesPanel(props: { summary: AccountBillingSummary }) {
  if (!props.summary.configured || props.summary.recentPurchases.length === 0) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="recent-purchases-title">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>History</p>
          <h2 id="recent-purchases-title">Recent checkout sessions</h2>
        </div>
      </div>

      <div className={styles.purchaseList}>
        {props.summary.recentPurchases.map((purchase) => (
          <div className={styles.purchaseRow} key={purchase.id}>
            <div>
              <strong>{purchase.planName || "React Motion Gallery"}</strong>
              <span>
                {purchase.billingCadence
                  ? `${purchase.billingCadence} - ${purchase.status}`
                  : purchase.status}
              </span>
            </div>
            <small>{purchase.amount}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = searchParams ? await searchParams : {};
  const purchaseIntent = getPurchaseIntent(params);
  const session = await getSession();
  const billingAccessEnabled = canAccessCustomerBilling(session);
  const summary =
    session && billingAccessEnabled
      ? await getAccountBillingSummary(session.email)
      : null;
  const notice = accountNotice(params);
  const devMagicLink = firstParam(params, "dev_magic_link");

  return (
    <main className={styles.accountPage}>
      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="account-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Account</p>
            <h1 id="account-title">Licenses, billing, and access</h1>
            <p>
              Sign in with the email you use at checkout to manage commercial
              licenses for React Motion Gallery.
            </p>
          </div>

          <div className={styles.heroAside}>
            {session ? (
              <>
                <span className={styles.identityPill}>
                  <UserRound aria-hidden="true" />
                  {session.email}
                </span>
                <form action={signOutAction}>
                  <button className={styles.ghostButton} type="submit">
                    <LogOut aria-hidden="true" />
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link className={styles.ghostButton} href="/license">
                View license options
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>

        {notice ? (
          <p className={styles.notice} data-tone={notice.tone}>
            {notice.text}
          </p>
        ) : null}

        {devMagicLink ? (
          <div className={styles.devMagicLink}>
            <span>Local development link</span>
            <a href={devMagicLink}>Open magic link</a>
          </div>
        ) : null}

        <div
          className={styles.contentGrid}
          data-has-purchase={purchaseIntent ? "true" : "false"}
          data-signed-in={session ? "true" : "false"}
        >
          {purchaseIntent ? (
            <PurchaseConfirmationPanel
              purchaseIntent={purchaseIntent}
              signedIn={Boolean(session)}
            />
          ) : null}

          <div className={styles.accountColumn}>
            {session ? (
              <AccountStatusPanel
                billingAccessEnabled={billingAccessEnabled}
                email={session.email}
                summary={summary}
              />
            ) : (
              <SignedOutPanel purchaseIntent={purchaseIntent} />
            )}
            {summary ? <RecentPurchasesPanel summary={summary} /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
