import { NextResponse } from "next/server";
import {
  setSessionCookie,
  verifyMagicLinkToken,
} from "@/lib/auth/session";
import {
  isBillingCadence,
  isPlanId,
} from "@/lib/billing/plans";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const payload = verifyMagicLinkToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/account?auth=magic-invalid", url));
  }

  await setSessionCookie(payload.email);

  const redirectUrl = new URL("/account", url);

  redirectUrl.searchParams.set("auth", "signed-in");

  if (isPlanId(payload.plan) && isBillingCadence(payload.billing)) {
    redirectUrl.searchParams.set("plan", payload.plan);
    redirectUrl.searchParams.set("billing", payload.billing);
  }

  return NextResponse.redirect(redirectUrl);
}
