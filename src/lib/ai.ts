/**
 * Align Assistant — the chat on the website.
 *
 * Speaks three wire protocols so the clinic can use whichever key it has:
 *   • Google Gemini              GEMINI_API_KEY
 *   • OpenAI chat/completions    OPENAI_API_KEY  (Groq, OpenRouter… via OPENAI_BASE_URL)
 *   • Anthropic messages         ANTHROPIC_API_KEY
 *
 * With no key, a deterministic responder built from the same clinic data
 * answers the common questions (hours, address, booking, treatments), so the
 * widget is useful on day one and never shows an error to a patient.
 *
 * Grounding rule: the model may only state facts from buildKnowledgeBase().
 * No fees, no diagnoses, no promises.
 */

import { clinic, doctor, learning } from "./clinic";
import { publishedInstruments } from "./instruments";
import { weeklyHours, SLOT_MINUTES, BOOKING_WINDOW_DAYS } from "./schedule";
import { formatDate, istDateKey, istTimeKey, dayOfWeek } from "./time";
import { treatments } from "./treatments";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type ProviderName = "gemini" | "openai" | "anthropic" | "fallback";

export type ResolvedProvider = {
  name: ProviderName;
  model: string;
  apiKey: string;
  baseUrl: string;
};

/* ------------------------------------------------------------------ */
/* Provider resolution                                                 */
/* ------------------------------------------------------------------ */

export function resolveProvider(): ResolvedProvider | null {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();

  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const anthropic = process.env.ANTHROPIC_API_KEY;

  const wants = (name: string) => !explicit || explicit === name;

  if (wants("gemini") && gemini) {
    return {
      name: "gemini",
      model: process.env.AI_MODEL || "gemini-2.5-flash",
      apiKey: gemini,
      baseUrl:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta",
    };
  }
  if (wants("openai") && openai) {
    return {
      name: "openai",
      model: process.env.AI_MODEL || "gpt-4o-mini",
      apiKey: openai,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    };
  }
  if (wants("anthropic") && anthropic) {
    return {
      name: "anthropic",
      model: process.env.AI_MODEL || "claude-haiku-4-5",
      apiKey: anthropic,
      baseUrl: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1",
    };
  }
  return null;
}

export function isAiConfigured(): boolean {
  return resolveProvider() !== null;
}

/* ------------------------------------------------------------------ */
/* Grounding                                                           */
/* ------------------------------------------------------------------ */

export function buildKnowledgeBase(): string {
  const today = istDateKey();
  return `
CLINIC: ${clinic.name} — ${clinic.tagline}
ADDRESS: ${clinic.addressLines.join(", ")} (${clinic.landmark})
PHONE / WHATSAPP: ${clinic.phoneDisplay}
TODAY (IST): ${formatDate(today)} (${weeklyHours[dayOfWeek(today)].day}), current time ${istTimeKey()}

HOURS
${weeklyHours.map((h) => `- ${h.day}: ${h.hours}`).join("\n")}

DENTIST
- ${doctor.name}, ${doctor.qualifications}
- ${doctor.title}. ${doctor.registration}
${doctor.degrees.map((d) => `- ${d.degree} (${d.field}), ${d.institution}, ${d.university}, ${d.year}`).join("\n")}
- Continuing education includes: ${learning.slice(0, 6).map((l) => l.title + (l.highlight ? ` (${l.highlight})` : "")).join("; ")}

TREATMENTS
${treatments.map((t) => `- ${t.name}: ${t.short}`).join("\n")}

EQUIPMENT IN THE CLINIC
${publishedInstruments.map((i) => `- ${i.name}: ${i.what}`).join("\n")}

TOKENS / APPOINTMENTS
- Book online on this website (the "Book a token" button). Pick a day, a ${SLOT_MINUTES}-minute time slot, and enter the patient's name and mobile number.
- Tokens can be booked from today up to ${BOOKING_WINDOW_DAYS} days ahead. The token number matches the time slot.
- The token number is shown immediately after booking. Patients can download it as an image, add it to their calendar, or share it; it is also saved automatically on the phone they booked from, under "My token". The front desk sees every booking live.
- To check or cancel: "My token" on the website, or call ${clinic.phoneDisplay}. The front desk can also find a booking by mobile number.
`.trim();
}

export function buildSystemPrompt(): string {
  return `You are "Align Assistant", the website assistant for ${clinic.name}, the dental clinic of ${doctor.name} in Bhopal, India.

You help visitors with practical questions: which treatment suits a general concern, clinic hours, how to reach the clinic, and how to book a token.

FACTS YOU MAY USE
${buildKnowledgeBase()}

RULES
1. Never diagnose, and never name a medicine or dose. Describe in general terms what a treatment is, then recommend a consultation with ${doctor.name}.
2. Dental emergency (facial swelling spreading to the eye or neck, difficulty breathing or swallowing, uncontrolled bleeding, a knocked-out tooth, jaw injury): tell them to call ${clinic.phoneDisplay} right away, and to go to the nearest hospital emergency if swelling affects breathing or swallowing. Keep it short and calm.
3. Reply in the language the visitor uses (English, Hindi or Roman Hindi). Plain words, two to four sentences or a few short bullets.
4. Only state facts listed above. You do NOT know fees or prices — say that fees depend on the examination and suggest calling ${clinic.phoneDisplay}. Do not guess about insurance, availability of specific brands, or anything not listed.
5. For appointments, point them to the "Book a token" button on this website.
6. Never invent reviews, awards, years of experience, patient numbers or claims of being "the best". Never promise outcomes or painlessness.
7. Do not ask for medical history or sensitive personal details.`;
}

/* ------------------------------------------------------------------ */
/* Streaming                                                           */
/* ------------------------------------------------------------------ */

const MAX_HISTORY = 12;
const MAX_TOKENS = 700;

function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

/** Splits an SSE byte stream into `data:` payload strings. */
async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line; a single event may carry
    // several `data:` lines that must be concatenated.
    let boundary: number;
    while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + (buffer[boundary] === "\r" ? 4 : 2));
      const payload = rawEvent
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("");
      if (payload && payload !== "[DONE]") yield payload;
    }
  }
}

async function assertOk(response: Response, provider: string) {
  if (response.ok) return;
  const detail = await response.text().catch(() => "");
  throw new Error(
    `${provider} request failed (${response.status}): ${detail.slice(0, 300)}`,
  );
}

/**
 * Streams the assistant's reply as text chunks.
 * Throws on transport/auth errors so callers can fall back gracefully.
 */
export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const provider = resolveProvider();
  if (!provider) {
    yield fallbackAnswer(messages.at(-1)?.content ?? "");
    return;
  }

  const history = trimHistory(messages);
  const system = buildSystemPrompt();

  if (provider.name === "gemini") {
    const response = await fetch(
      `${provider.baseUrl}/models/${provider.model}:streamGenerateContent?alt=sse&key=${provider.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { temperature: 0.4, maxOutputTokens: MAX_TOKENS },
          safetySettings: [],
        }),
      },
    );
    await assertOk(response, "Gemini");
    if (!response.body) throw new Error("Gemini returned an empty stream");

    for await (const payload of sseData(response.body)) {
      try {
        const parsed = JSON.parse(payload);
        const parts = parsed?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts) if (part?.text) yield part.text as string;
        }
      } catch {
        /* Ignore keep-alive or partial frames. */
      }
    }
    return;
  }

  if (provider.name === "anthropic") {
    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal,
      body: JSON.stringify({
        model: provider.model,
        system,
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
        stream: true,
        messages: history,
      }),
    });
    await assertOk(response, "Anthropic");
    if (!response.body) throw new Error("Anthropic returned an empty stream");

    for await (const payload of sseData(response.body)) {
      try {
        const parsed = JSON.parse(payload);
        if (parsed?.type === "content_block_delta" && parsed?.delta?.text) {
          yield parsed.delta.text as string;
        }
      } catch {
        /* Ignore ping frames. */
      }
    }
    return;
  }

  // OpenAI-compatible (OpenAI, Groq, OpenRouter, Together, DeepSeek, Ollama…)
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: provider.model,
      stream: true,
      temperature: 0.4,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });
  await assertOk(response, "OpenAI-compatible");
  if (!response.body) throw new Error("Provider returned an empty stream");

  for await (const payload of sseData(response.body)) {
    try {
      const parsed = JSON.parse(payload);
      const delta = parsed?.choices?.[0]?.delta?.content;
      if (delta) yield delta as string;
    } catch {
      /* Ignore. */
    }
  }
}

/** Non-streaming convenience wrapper. */
export async function completeChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  let out = "";
  for await (const chunk of streamChat(messages, signal)) out += chunk;
  return out.trim();
}


/* ------------------------------------------------------------------ */
/* Keyword fallback (no API key, or provider failure)                  */
/* ------------------------------------------------------------------ */

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export function fallbackAnswer(question: string): string {
  const q = question.toLowerCase();

  if (has(q, ["swelling", "swollen", "bleeding", "knocked", "broke my jaw", "can't swallow", "cant swallow", "breath", "sujan", "soojan", "khoon"])) {
    return `That sounds like it needs attention quickly. Please call **${clinic.phoneDisplay}** now. If the swelling is affecting your breathing or swallowing, go to the nearest hospital emergency straight away.`;
  }

  if (has(q, ["fee", "fees", "price", "cost", "charge", "kitna", "kharcha", "paisa", "rate"])) {
    return `Fees depend on what the examination finds, so we don’t publish a price list. Please call **${clinic.phoneDisplay}** and the clinic will guide you.`;
  }

  if (has(q, ["time", "timing", "hour", "open", "close", "kab", "khula", "band", "sunday", "wednesday", "today"])) {
    return `**Clinic hours (open all 7 days):**\n- Sun–Tue, Thu–Sat: 10 am – 2 pm and 5 – 9 pm\n- Wednesday: 10 am – 9 pm\n\nBook a token online to skip the wait.`;
  }

  if (has(q, ["where", "address", "location", "direction", "map", "kahan", "kaha", "pata", "reach"])) {
    return `We’re at **${clinic.addressLines.join(", ")}** — ${clinic.landmark}. Open the Visit page for Google Maps directions, or call ${clinic.phoneDisplay}.`;
  }

  if (has(q, ["book", "token", "appointment", "slot", "booking", "cancel", "my token"])) {
    return `Tap **Book a token**, choose a day and a ${SLOT_MINUTES}-minute slot, and enter the patient’s name and mobile. Your token number appears instantly — save it as an image, add it to your calendar, or find it later under **My token** on the same phone.`;
  }

  if (has(q, ["doctor", "nikita", "qualification", "degree", "mds", "bds", "orthodont", "who"])) {
    return `${doctor.name} is an orthodontist — **${doctor.qualifications}** — and a braces & aligner specialist. She completed her MDS at K.D. Dental College, Mathura, with research on smile proportions.`;
  }

  const match = treatments.find((t) =>
    has(q, [t.name.toLowerCase(), ...t.slug.split("-"), ...(t.slug === "clear-aligners" ? ["invisalign", "aligner"] : []), ...(t.slug === "braces" ? ["brace", "teedhe", "tedhe", "crooked"] : []), ...(t.slug === "root-canal" ? ["rct", "pain", "dard"] : []), ...(t.slug === "dental-implants" ? ["missing"] : [])]),
  );
  if (match) {
    return `**${match.name}** — ${match.short}\n\nThe right option depends on an examination. You can read more on the Treatments page, or book a token to see ${doctor.name}.`;
  }

  return `I can help with **hours**, **directions**, **treatments** (aligners, braces, implants, root canal, smile design, laser) and **booking a token**. For anything else, please call ${clinic.phoneDisplay}.`;
}
