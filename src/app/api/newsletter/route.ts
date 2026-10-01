import { NextResponse } from "next/server";
import { addToNewsletter, KlaviyoConfigError } from "@/lib/klaviyo";
import { emailField, field, isBot } from "@/lib/formFields";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (isBot(body)) return NextResponse.json({ success: true });

  const email = emailField(body.email);
  if (!email) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  try {
    await addToNewsletter(email, field(body.source, 60) ?? "website");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ error: "unavailable" }, { status: error instanceof KlaviyoConfigError ? 503 : 502 });
  }
}
