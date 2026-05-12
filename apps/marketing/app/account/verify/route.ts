import { NextResponse } from "next/server";
import {
  setSessionCookie,
  verifyMagicLinkToken,
} from "@/lib/auth/session";
import {
  getBillingCadenceOrDefault,
  getPlanIdOrDefault,
} from "@/lib/billing/plans";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const payload = verifyMagicLinkToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/account?auth=magic-invalid", url));
  }

  await setSessionCookie(payload.email);

  const plan = getPlanIdOrDefault(payload.plan);
  const billing = getBillingCadenceOrDefault(payload.billing);
  const redirectUrl = new URL("/account", url);

  redirectUrl.searchParams.set("auth", "signed-in");
  redirectUrl.searchParams.set("plan", plan);
  redirectUrl.searchParams.set("billing", billing);

  return NextResponse.redirect(redirectUrl);
}
