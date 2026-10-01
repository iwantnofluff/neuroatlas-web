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

function config() {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_WAITLIST_LIST_ID;
  if (!apiKey || !listId) {
    throw new KlaviyoConfigError("KLAVIYO_PRIVATE_API_KEY and KLAVIYO_WAITLIST_LIST_ID must be set");
  }
  return { apiKey, listId };
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

/**
 * Adds a waitlist signup to Klaviyo in two calls, because the subscribe
 * endpoint accepts no profile properties:
 * 1. `profile-import` creates or updates the profile with the form's
 *    details (role as `title`, organisation as `organization`, sector,
 *    reason and source as custom properties). Omitted fields are left
 *    untouched on an existing profile.
 * 2. `profile-subscription-bulk-create-jobs` adds the email to the waitlist
 *    list with email marketing consent, which Klaviyo timestamps.
 */
export async function addToWaitlist(signup: WaitlistSignup) {
  const { apiKey, listId } = config();
  const properties = Object.fromEntries(
    Object.entries({
      waitlist_sector: signup.sector,
      waitlist_reason: signup.reason,
      waitlist_source: signup.source,
    }).filter(([, value]) => value)
  );

  await klaviyo("/profile-import", apiKey, {
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

  await klaviyo("/profile-subscription-bulk-create-jobs", apiKey, {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email: signup.email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          ],
        },
      },
      relationships: { list: { data: { type: "list", id: listId } } },
    },
  });
}
