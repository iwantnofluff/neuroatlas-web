"use client";

import { useRef, useState, type FormEvent } from "react";

export type FormStatus = "idle" | "submitting" | "done" | "error";

/** Posts a form's fields (plus `extra`) as JSON to `endpoint`. Entries stay
 *  in the form on failure so nothing the visitor typed is lost. */
export function useFormSubmit(endpoint: string, extra?: Record<string, string>) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const busy = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setStatus("submitting");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget)), ...extra }),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }

  return { status, submitting: status === "submitting", onSubmit };
}
