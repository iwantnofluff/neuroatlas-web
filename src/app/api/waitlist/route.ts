import { NextResponse } from "next/server";
import { addToWaitlist, KlaviyoConfigError } from "@/lib/klaviyo";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 120, role: 120, organisation: 160, sector: 120, reason: 2000, source: 60 } as const;

function text(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Honeypot: a field real visitors never see. Bots that fill it get a
  // success response and are not sent to Klaviyo.
  if (text(body.company_website, 200)) return NextResponse.json({ success: true });

  const email = text(body.email, 254)?.toLowerCase();
  if (!email || !EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    await addToWaitlist({
      email,
      name: text(body.name, LIMITS.name),
      role: text(body.role, LIMITS.role),
      organisation: text(body.organisation, LIMITS.organisation),
      sector: text(body.sector, LIMITS.sector),
      reason: text(body.reason, LIMITS.reason),
      source: text(body.source, LIMITS.source) ?? "website",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[waitlist]", error);
    const status = error instanceof KlaviyoConfigError ? 503 : 502;
    return NextResponse.json({ error: "waitlist_unavailable" }, { status });
  }
}
