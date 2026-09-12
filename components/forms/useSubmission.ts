"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HONEYPOT, REASON_COPY, type ApiResult, type Reason } from "@/lib/forms/shared";

/* ==========================================================================
   The submit loop every form on the site runs in the browser.

   The inputs are uncontrolled: the values are read off the form element
   itself when they are needed, so the form works identically before and
   after hydration, and a post with JavaScript off carries the same names.

   Validation follows "reward early, punish late":
     · on submit, every field is checked and focus moves to the first one
       that needs attention;
     · on blur, a field with something typed in it is checked;
     · while typing or choosing, an error is only ever CLEARED, never added.
   So nobody is told off for tabbing past a field they have not reached.

   The server's answer is handled the same way: its field errors land on the
   fields, and focus moves to the first of them.
   ========================================================================== */

export type Values = Record<string, string | string[]>;
export type Errors = Record<string, string>;
export type Status = "idle" | "sending" | "done" | "failed";
export type Failure = { title: string; body: string };

/** Everything named in a form, as the server's urlencoded parser reads it:
 *  a repeated name (a checkbox group) becomes a list. */
export function readValues(form: HTMLFormElement): Values {
  const out: Values = {};
  for (const [key, value] of new FormData(form)) {
    if (typeof value !== "string") continue;
    const prev = out[key];
    out[key] = prev === undefined ? value : Array.isArray(prev) ? [...prev, value] : [prev, value];
  }
  return out;
}

const NETWORK: Failure = {
  title: "We could not reach the site.",
  body: "Nothing was sent. Check your connection and send it again, or email the officers.",
};

/** The element to focus for a field: the control itself, or the first
 *  option of a group (the checked one, if there is one). */
function controlFor(form: HTMLFormElement, name: string): HTMLElement | null {
  const item = form.elements.namedItem(name);
  if (!item) return null;
  if (item instanceof RadioNodeList) {
    const list = Array.from(item).filter((el): el is HTMLInputElement => el instanceof HTMLInputElement);
    return list.find((el) => el.checked) ?? list[0] ?? null;
  }
  return item instanceof HTMLElement ? item : null;
}

export function useSubmission({
  endpoint,
  order,
  validate,
  initialErrors,
  onSent,
}: {
  endpoint: string;
  /** Field names in the order they appear, for focusing the first error. */
  order: readonly string[];
  /** Every field's error for these values, or an empty object. */
  validate: (values: Values) => Errors;
  /** Errors a no-JavaScript round trip reported, keyed by field. */
  initialErrors?: Errors;
  /** Called with the submitted values once the server accepts them. */
  onSent?: (values: Values) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>(initialErrors ?? {});
  const [failure, setFailure] = useState<Failure | null>(null);
  /* Bumped on every refused attempt. It re-keys the error summary so its
     one-shot crash animation plays for each attempt, and it triggers the
     focus move once the new errors are on the page. */
  const [attempt, setAttempt] = useState(0);
  const sending = useRef(false);

  /* With JavaScript running, this code validates, so the browser's own
     bubbles are switched off. Without it, `required` and `type="email"` still
     give a person native checks before the post. */
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true;
  }, []);

  // Move focus to the first field that needs attention, after the render
  // that marks it invalid, so a screen reader hears the error with it.
  useEffect(() => {
    if (attempt === 0) return;
    const form = formRef.current;
    const first = form && order.find((name) => errors[name]);
    if (form && first) controlFor(form, first)?.focus();
    // Only a new attempt moves focus; later edits to `errors` must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const check = useCallback(
    (name: string, mode: "blur" | "change") => {
      const form = formRef.current;
      if (!form || !order.includes(name)) return;
      const values = readValues(form);
      const message = validate(values)[name];
      setErrors((prev) => {
        if (!message) {
          if (!prev[name]) return prev;
          const next = { ...prev };
          delete next[name];
          return next;
        }
        if (mode === "change" && !prev[name]) return prev;
        if (mode === "blur") {
          const raw = values[name];
          const typed = Array.isArray(raw) ? raw.length > 0 : (raw ?? "").trim() !== "";
          if (!typed && !prev[name]) return prev;
        }
        return prev[name] === message ? prev : { ...prev, [name]: message };
      });
    },
    [order, validate],
  );

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLFormElement>) => {
      const el = e.target as unknown as HTMLInputElement;
      if (!el.name || el.type === "radio" || el.type === "checkbox") return;
      check(el.name, "blur");
    },
    [check],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      const el = e.target as unknown as HTMLInputElement;
      if (el.name) check(el.name, "change");
    },
    [check],
  );

  const refuse = useCallback((next: Errors) => {
    setErrors(next);
    setAttempt((n) => n + 1);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (sending.current) return;
      const form = e.currentTarget;
      const values = readValues(form);
      const { [HONEYPOT]: _trap, ...answers } = values;
      void _trap;

      const found = validate(answers);
      if (Object.keys(found).length > 0) {
        setFailure(null);
        refuse(found);
        return;
      }

      sending.current = true;
      setStatus("sending");
      setFailure(null);
      setErrors({});
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          // The trap travels with the answers. A filled one is accepted by the
          // server and quietly not delivered.
          body: JSON.stringify(values),
        });
        let data: ApiResult | null = null;
        try {
          data = (await res.json()) as ApiResult;
        } catch {
          data = null;
        }

        if (res.ok && data?.ok) {
          setStatus("done");
          onSent?.(answers);
          return;
        }

        const fields = data && !data.ok ? data.fields : undefined;
        if (fields && Object.keys(fields).length > 0) {
          setStatus("idle");
          refuse(fields);
          return;
        }
        const reason: Reason = data && !data.ok && data.reason ? data.reason : "failed";
        setFailure(REASON_COPY[reason]);
        setStatus("failed");
        setAttempt((n) => n + 1);
      } catch {
        setFailure(NETWORK);
        setStatus("failed");
        setAttempt((n) => n + 1);
      } finally {
        sending.current = false;
      }
    },
    [endpoint, onSent, refuse, validate],
  );

  return { formRef, status, errors, failure, attempt, onSubmit, onBlur, onChange };
}
