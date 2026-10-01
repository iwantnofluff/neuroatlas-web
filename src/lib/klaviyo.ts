const KLAVIYO_API = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2026-07-15";

export type WaitlistSignup = {
  email: string;
  name?: string;
  role?: string;
  organisation?: string;
  sector?: string;
  reason?: string;
  source: string;
};

export class KlaviyoConfigError extends Error {}

function apiKey() {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!key) throw new KlaviyoConfigError("KLAVIYO_PRIVATE_API_KEY must be set");
  return key;
}

function listId(name: "KLAVIYO_WAITLIST_LIST_ID" | "KLAVIYO_NEWSLETTER_LIST_ID") {
  const id = process.env[name];
  if (!id) throw new KlaviyoConfigError(`${name} must be set`);
  return id;
}

async function klaviyo(path: string, apiKey: string, body: unknown) {
  const response = await fetch(`${KLAVIYO_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: KLAVIYO_REVISION,
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Klaviyo ${path} failed with ${response.status}: ${detail.slice(0, 500)}`);
  }
}

function splitName(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  return { first_name: parts[0], ...(parts.length > 1 && { last_name: parts.slice(1).join(" ") }) };
}

/** Adds an email to a list with email marketing consent, which Klaviyo
 *  timestamps. The subscribe endpoint accepts no profile properties. */
async function subscribe(key: string, email: string, list: string) {
  await klaviyo("/profile-subscription-bulk-create-jobs", key, {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          ],
        },
      },
      relationships: { list: { data: { type: "list", id: list } } },
    },
  });
}

/**
 * Adds a waitlist signup to Klaviyo in two calls, because the subscribe
 * endpoint accepts no profile properties:
 * 1. `profile-import` creates or updates the profile with the form's
 *    details (role as `title`, organisation as `organization`, sector,
 *    reason and source as custom properties). Omitted fields are left
 *    untouched on an existing profile.
 * 2. The email is subscribed to the waitlist list.
 */
export async function addToWaitlist(signup: WaitlistSignup) {
  const key = apiKey();
  const list = listId("KLAVIYO_WAITLIST_LIST_ID");
  const properties = Object.fromEntries(
    Object.entries({
      waitlist_sector: signup.sector,
      waitlist_reason: signup.reason,
      waitlist_source: signup.source,
    }).filter(([, value]) => value)
  );

  await klaviyo("/profile-import", key, {
    data: {
      type: "profile",
      attributes: {
        email: signup.email,
        ...splitName(signup.name),
        ...(signup.role && { title: signup.role }),
        ...(signup.organisation && { organization: signup.organisation }),
        properties,
      },
    },
  });

  await subscribe(key, signup.email, list);
}

/** Subscribes an email to the newsletter list. `source` (footer, journal)
 *  is recorded on the profile as `newsletter_source`. */
export async function addToNewsletter(email: string, source: string) {
  const key = apiKey();
  const list = listId("KLAVIYO_NEWSLETTER_LIST_ID");
  await klaviyo("/profile-import", key, {
    data: { type: "profile", attributes: { email, properties: { newsletter_source: source } } },
  });
  await subscribe(key, email, list);
}

/**
 * Records a contact form enquiry as a "Submitted Contact Form" event on
 * the sender's profile (created if new), with the message as an event
 * property. No marketing consent is given: an enquiry is not a newsletter
 * signup. A Klaviyo flow triggered by this metric can email the team an
 * internal alert. Needs the API key's Events scope.
 */
export async function recordContactEnquiry(enquiry: { email: string; name?: string; message: string }) {
  await klaviyo("/events", apiKey(), {
    data: {
      type: "event",
      attributes: {
        properties: { message: enquiry.message, name: enquiry.name ?? "", source: "contact-page" },
        metric: { data: { type: "metric", attributes: { name: "Submitted Contact Form" } } },
        profile: { data: { type: "profile", attributes: { email: enquiry.email, ...splitName(enquiry.name) } } },
      },
    },
  });
}
