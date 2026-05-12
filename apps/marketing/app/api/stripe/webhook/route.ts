import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type StripeWebhookEvent = {
  data: {
    object: unknown;
  };
  id: string;
  type: string;
};

const WEBHOOK_TOLERANCE_SECONDS = 60 * 5;

function parseStripeSignature(header: string): {
  timestamp: string | null;
  signatures: string[];
} {
  const parts = header.split(",");
  const signatures: string[] = [];
  let timestamp: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=");

    if (key === "t") {
      timestamp = value;
    }

    if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  return { signatures, timestamp };
}

function safeCompareHex(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  const { signatures, timestamp } = parseStripeSignature(signatureHeader);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampNumber = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isFinite(timestampNumber) ||
    Math.abs(now - timestampNumber) > WEBHOOK_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => safeCompareHex(expected, signature));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature || !verifyStripeWebhookSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeWebhookEvent;

  if (
    [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed",
    ].includes(event.type)
  ) {
    console.info(`Received Stripe event ${event.type}`, event.id);
  }

  return NextResponse.json({ received: true });
}
