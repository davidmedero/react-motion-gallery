import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export type AccountSession = {
  authMethod: "magic-link";
  email: string;
  issuedAt: number;
  expiresAt: number;
  verifiedAt: number;
};

export type MagicLinkToken = {
  billing?: string;
  email: string;
  expiresAt: number;
  issuedAt: number;
  plan?: string;
  purpose: "magic-link";
};

const SESSION_COOKIE = "rmg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAGIC_LINK_TTL_SECONDS = 60 * 15;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSessionSecret(): string {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required for account sessions in production.");
  }

  return secret || "react-motion-gallery-local-development-session-secret";
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function parseEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email;
}

export function canAccessCustomerBilling(
  session: AccountSession | null
): session is AccountSession {
  return session?.authMethod === "magic-link";
}

function createSignedToken(payload: object): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function readSignedToken<T>(token: string): T | null {
  const [encodedPayload, receivedSignature] = token.split(".");

  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (!signaturesMatch(expectedSignature, receivedSignature)) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(encodedPayload)) as T;
  } catch {
    return null;
  }
}

export function createMagicLinkToken(options: {
  billing?: string;
  email: string;
  plan?: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: MagicLinkToken = {
    billing: options.billing,
    email: options.email,
    expiresAt: now + MAGIC_LINK_TTL_SECONDS,
    issuedAt: now,
    plan: options.plan,
    purpose: "magic-link",
  };

  return createSignedToken(payload);
}

export function verifyMagicLinkToken(token: string | null): MagicLinkToken | null {
  if (!token) {
    return null;
  }

  const payload = readSignedToken<MagicLinkToken>(token);
  const now = Math.floor(Date.now() / 1000);

  if (
    !payload ||
    payload.purpose !== "magic-link" ||
    !payload.email ||
    payload.expiresAt <= now
  ) {
    return null;
  }

  return payload;
}

export async function getSession(): Promise<AccountSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = readSignedToken<AccountSession>(token);
  const now = Math.floor(Date.now() / 1000);

  if (
    !session ||
    session.authMethod !== "magic-link" ||
    !session.email ||
    session.expiresAt <= now
  ) {
    return null;
  }

  return session;
}

export async function setSessionCookie(email: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const session: AccountSession = {
    authMethod: "magic-link",
    email,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS,
    verifiedAt: now,
  };

  const token = createSignedToken(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
