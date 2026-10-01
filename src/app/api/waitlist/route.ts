import { NextResponse } from "next/server";
import { addToWaitlist, KlaviyoConfigError } from "@/lib/klaviyo";
import { emailField, field, isBot } from "@/lib/formFields";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (isBot(body)) return NextResponse.json({ success: true });

  const email = emailField(body.email);
  if (!email) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  try {
    await addToWaitlist({
      email,
      name: field(body.name, 120),
      role: field(body.role, 120),
      organisation: field(body.organisation, 160),
      sector: field(body.sector, 120),
      reason: field(body.reason, 2000),
      source: field(body.source, 60) ?? "website",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[waitlist]", error);
    return NextResponse.json({ error: "unavailable" }, { status: error instanceof KlaviyoConfigError ? 503 : 502 });
  }
}
