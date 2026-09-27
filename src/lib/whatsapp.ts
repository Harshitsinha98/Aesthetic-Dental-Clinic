/**
 * WhatsApp Cloud API transport — outbound notifications only.
 *
 * Two audiences get a message when a token is booked or cancelled:
 *   • the patient — their token card
 *   • the doctor  — a "new booking" alert (DOCTOR_WHATSAPP_NUMBER)
 *
 * Why templates: a booking made on the website is a *business-initiated*
 * conversation. Meta only delivers those as pre-approved **template** messages;
 * a plain text message is refused unless the recipient has messaged the
 * business number in the last 24 hours. So when a template name is configured
 * it is used, and plain text is only the fallback for testing.
 *
 * Every attempt is written to `wa_outbox` first. With no credentials the
 * message is recorded as `logged` instead of being sent, so the whole flow can
 * be tested — and read on /admin — before the Meta account is approved.
 *
 * Failures never throw: a booking safely stored in the database must not be
 * rolled back because a notification could not be delivered.
 */

import { db } from "./db";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";

/** Test number supplied by the clinic owner; override with the env var. */
const DEFAULT_DOCTOR_NUMBER = "919653043939";

export type Audience = "patient" | "doctor";

type Config = { token: string; phoneNumberId: string };

function config(): Config | null {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return token && phoneNumberId ? { token, phoneNumberId } : null;
}

export function isWhatsAppConfigured() {
  return config() !== null;
}

export function doctorWhatsAppNumber(): string {
  return (process.env.DOCTOR_WHATSAPP_NUMBER || DEFAULT_DOCTOR_NUMBER).replace(/\D/g, "");
}

export type Template = {
  name: string;
  language: string;
  /** Body variables {{1}}, {{2}} … in order. */
  params: string[];
};

export type OutboundMessage = {
  to: string;
  audience: Audience;
  reference?: string;
  /** Human-readable text — sent as-is when no template is configured, and
      always stored in the outbox so staff can see what went out. */
  text: string;
  template?: Template | null;
};

export type SendResult = { ok: boolean; simulated: boolean; error?: string };

async function record(
  message: OutboundMessage,
  kind: string,
  status: "sent" | "failed" | "logged",
  error?: string,
) {
  try {
    const sql = await db();
    await sql.run(
      `INSERT INTO wa_outbox (to_phone, body, kind, audience, reference, status, error, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.to,
        message.text,
        kind,
        message.audience,
        message.reference ?? null,
        status,
        error ?? null,
        new Date().toISOString(),
      ],
    );
  } catch (dbError) {
    console.error("[whatsapp] could not record outbox entry:", dbError);
  }
}

export async function sendWhatsApp(input: OutboundMessage): Promise<SendResult> {
  const message = { ...input, to: input.to.replace(/\D/g, "") };
  const cfg = config();
  const kind = message.template ? `template:${message.template.name}` : "text";

  if (!cfg) {
    await record(message, kind, "logged");
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[whatsapp:simulated → ${message.audience}] +${message.to}\n${message.text}\n${"─".repeat(48)}`);
    }
    return { ok: true, simulated: true };
  }

  const payload = message.template
    ? {
        messaging_product: "whatsapp",
        to: message.to,
        type: "template",
        template: {
          name: message.template.name,
          language: { code: message.template.language },
          components: [
            {
              type: "body",
              parameters: message.template.params.map((text) => ({
                type: "text",
                // Template variables may not contain newlines or 4+ spaces.
                text: text.replace(/\s+/g, " ").trim().slice(0, 900) || "-",
              })),
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "text",
        text: { preview_url: false, body: message.text },
      };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      await record(message, kind, "failed", `${response.status} ${detail}`);
      return { ok: false, simulated: false, error: String(response.status) };
    }
    await record(message, kind, "sent");
    return { ok: true, simulated: false };
  } catch (error) {
    const reason = (error as Error).message;
    await record(message, kind, "failed", reason);
    return { ok: false, simulated: false, error: reason };
  }
}

/** Reads a template name from the environment, or null to fall back to text. */
export function templateFromEnv(envName: string, params: string[]): Template | null {
  const name = process.env[envName]?.trim();
  if (!name) return null;
  return { name, language: process.env.WHATSAPP_TEMPLATE_LANG || "en", params };
}

/* ------------------------------------------------------------------ */

export type OutboxEntry = {
  id: number;
  to: string;
  body: string;
  kind: string;
  audience: string | null;
  reference: string | null;
  status: string;
  error: string | null;
  createdAt: string;
};

export async function recentOutbox(limit = 40): Promise<OutboxEntry[]> {
  const sql = await db();
  const rows = await sql.all<Record<string, unknown>>(
    `SELECT * FROM wa_outbox ORDER BY id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    to: String(r.to_phone),
    body: String(r.body),
    kind: String(r.kind),
    audience: (r.audience as string) ?? null,
    reference: (r.reference as string) ?? null,
    status: String(r.status),
    error: (r.error as string) ?? null,
    createdAt: String(r.created_at),
  }));
}
