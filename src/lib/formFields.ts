export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims a submitted field and caps its length; empty becomes undefined. */
export function field(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/** The validated, lower-cased email, or undefined when it is not one. */
export function emailField(value: unknown) {
  const email = field(value, 254)?.toLowerCase();
  return email && EMAIL_PATTERN.test(email) ? email : undefined;
}

/** Honeypot: a hidden field real visitors never fill. */
export function isBot(body: Record<string, unknown>) {
  return Boolean(field(body.company_website, 200));
}
