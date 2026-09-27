/**
 * POST /api/chat — streaming AI assistant for the website widget.
 *
 * Streams plain UTF-8 text chunks (not SSE) so the client can simply append
 * whatever arrives. If the upstream provider errors mid-flight, the
 * deterministic keyword responder is streamed instead — a patient asking about
 * OPD timings should never be shown a stack trace.
 */

import { z } from "zod";
import { fallbackAnswer, isAiConfigured, streamChat, type ChatMessage } from "@/lib/ai";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(24),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "chat"), 30, 60_000);
  if (!limit.allowed) {
    return tooManyRequests(
      limit,
      "You are sending messages very quickly. Please wait a moment.",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid message list." }, { status: 400 });
  }

  const messages = parsed.data.messages as ChatMessage[];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;
      try {
        for await (const chunk of streamChat(messages, request.signal)) {
          emitted = true;
          controller.enqueue(encoder.encode(chunk));
        }
        if (!emitted) {
          controller.enqueue(
            encoder.encode(fallbackAnswer(lastUserMessage?.content ?? "")),
          );
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          controller.close();
          return;
        }
        console.error("[chat] provider failed:", (error as Error).message);
        // Nothing has been sent yet in the common failure case (auth, quota),
        // so the patient still gets a complete, useful answer.
        if (!emitted) {
          controller.enqueue(
            encoder.encode(fallbackAnswer(lastUserMessage?.content ?? "")),
          );
        } else {
          controller.enqueue(
            encoder.encode(
              "\n\n_(Connection interrupted. Please call +91 74770 03741 if you need immediate help.)_",
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-AI-Mode": isAiConfigured() ? "live" : "fallback",
    },
  });
}
