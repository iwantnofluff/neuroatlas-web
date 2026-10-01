/** Hidden from people and assistive tech; bots that fill it are dropped
 *  server-side (see lib/formFields.ts isBot). */
export function FormHoneypot({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Company website</label>
      <input id={id} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export const FORM_ERROR_MESSAGE = "Something went wrong and your details were not sent. Please try again.";
