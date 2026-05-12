type MagicLinkEmailResult =
  | { delivered: true; provider: "resend" }
  | { delivered: false; provider: "console" };

const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getEmailFromAddress(): string | null {
  return process.env.AUTH_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || null;
}

export async function sendMagicLinkEmail(options: {
  email: string;
  magicLink: string;
}): Promise<MagicLinkEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();
  const subject = "Sign in to React Motion Gallery";
  const text = [
    "Use this link to sign in to React Motion Gallery:",
    "",
    options.magicLink,
    "",
    "This link expires in 15 minutes.",
  ].join("\n");
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #0c0910;">
      <p>Use this link to sign in to React Motion Gallery:</p>
      <p>
        <a href="${escapeHtml(options.magicLink)}" style="color: #cb56a3; font-weight: 700;">
          Sign in to your account
        </a>
      </p>
      <p style="color: #5d5865;">This link expires in 15 minutes.</p>
    </div>
  `;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY and AUTH_EMAIL_FROM are required.");
    }

    console.info(`React Motion Gallery magic link for ${options.email}: ${options.magicLink}`);
    return { delivered: false, provider: "console" };
  }

  const response = await fetch(RESEND_API_URL, {
    body: JSON.stringify({
      from,
      html,
      subject,
      text,
      to: [options.email],
    }),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || "Magic link email could not be sent.";
    throw new Error(message);
  }

  return { delivered: true, provider: "resend" };
}
