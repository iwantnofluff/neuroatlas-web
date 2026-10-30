"use client";

import { useRef, useState, type FormEvent } from "react";
import { trackConversion, type ConversionEvent } from "@/lib/analytics";

export type FormStatus = "idle" | "submitting" | "done" | "error";

/** Posts a form's fields (plus `extra`) as JSON to `endpoint` and records
 *  `conversion` when it succeeds. Entries stay in the form on failure so
 *  nothing the visitor typed is lost. */
export function useFormSubmit(
  endpoint: string,
  conversion: { event: ConversionEvent; location: string },
  extra?: Record<string, string>
) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const busy = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setStatus("submitting");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, ...extra }),
      });
      setStatus(response.ok ? "done" : "error");
      if (response.ok && !fields.company_website) trackConversion(conversion.event, conversion.location);
    } catch {
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }

  return { status, submitting: status === "submitting", onSubmit };
}
