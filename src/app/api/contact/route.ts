import { NextResponse } from "next/server";
import { recordContactEnquiry, KlaviyoConfigError } from "@/lib/klaviyo";
import { emailField, field, isBot } from "@/lib/formFields";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (isBot(body)) return NextResponse.json({ success: true });

  const email = emailField(body.email);
  const message = field(body.message, 5000);
  if (!email) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "missing_message" }, { status: 400 });

  try {
    await recordContactEnquiry({ email, name: field(body.name, 120), message });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "unavailable" }, { status: error instanceof KlaviyoConfigError ? 503 : 502 });
  }
}
