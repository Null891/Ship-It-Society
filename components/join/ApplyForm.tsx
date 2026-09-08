"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  EXPERIENCE,
  GRADES,
  applicationSchema,
  type Application,
  type FieldErrors,
} from "@/lib/apply";
import { club, join } from "@/content/club";
import { DUR, EASE_OUT_EXPO } from "@/lib/motion";

/* ==========================================================================
   The application form.

   Validation runs against the same zod schema the route handler uses.
   Errors are inline and specific — never a toast, which vanishes before a
   student has read it and is unreachable to a screen reader afterwards.
   ========================================================================== */

const inputBase =
  // No outline-none here. It is a utility, so it outranks the global
  // :focus-visible rule in the base layer and silently removes the keyboard
  // focus ring from every text field. The border darkening is a supplement to
  // the ring, never a replacement for it.
  "w-full rounded-inset border bg-paper px-4 py-3 text-base transition-[border-color] duration-[var(--dur-fast)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-surface-900)]";

function fieldClasses(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-[var(--color-marigold-ink)]"
      : "border-[var(--color-line-light)]"
  }`;
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT_EXPO }}
          className="overflow-hidden text-sm text-marigold-ink"
        >
          <span className="block pt-2">{children}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function ApplyForm() {
  const uid = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Application>({
    resolver: zodResolver(applicationSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: Application) {
    setStatus("sending");
    setServerMessage("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: { ok: boolean; message?: string; fields?: FieldErrors } =
        await res.json();

      if (!res.ok || !data.ok) {
        // Re-project server-side field errors back onto the form so the
        // student is taken to the field that needs attention.
        if (data.fields) {
          for (const [key, message] of Object.entries(data.fields)) {
            if (message) setError(key as keyof Application, { message });
          }
        }
        setServerMessage(data.message ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setServerMessage(
        "We could not reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.xslow, ease: EASE_OUT_EXPO }}
        className="rounded-card border border-[var(--color-line-light)] bg-paper p-8 md:p-10"
        role="status"
      >
        <span
          aria-hidden
          className="mb-6 inline-block h-2.5 w-2.5 bg-marigold"
        />
        <h2 className="text-2xl font-semibold tracking-[-0.028em]">
          {join.success.title}
        </h2>
        <p className="pretty mt-3 max-w-[44ch] text-base text-[var(--stage-muted)]">
          {join.success.body}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[46rem]">
      {/* Honeypot. Hidden from people and from assistive tech; bots fill it. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="mono-label block pb-2.5">
            Name
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            className={fieldClasses(!!errors.name)}
            {...register("name")}
          />
          <ErrorText id={`${uid}-name-err`}>{errors.name?.message}</ErrorText>
        </div>

        <div>
          <label htmlFor={`${uid}-email`} className="mono-label block pb-2.5">
            Email
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={fieldClasses(!!errors.email)}
            {...register("email")}
          />
          <ErrorText id={`${uid}-email-err`}>{errors.email?.message}</ErrorText>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="mono-label pb-3">Grade</legend>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <label
              key={g}
              className="cursor-pointer rounded-pill border border-[var(--color-line-light)] px-5 py-2.5 text-base transition-[border-color,background-color] duration-[var(--dur-fast)] has-[:checked]:border-transparent has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marigold"
            >
              <input
                type="radio"
                value={g}
                className="sr-only"
                {...register("grade")}
              />
              {g}
            </label>
          ))}
        </div>
        <ErrorText id={`${uid}-grade-err`}>{errors.grade?.message}</ErrorText>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mono-label pb-3">Coding experience</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {EXPERIENCE.map((e) => (
            <label
              key={e.value}
              className="cursor-pointer rounded-inset border border-[var(--color-line-light)] p-4 transition-[border-color] duration-[var(--dur-fast)] has-[:checked]:border-[var(--color-surface-900)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marigold"
            >
              <input
                type="radio"
                value={e.value}
                className="sr-only"
                {...register("experience")}
              />
              <span className="block text-base font-medium">{e.label}</span>
              <span className="mt-1 block text-sm text-[var(--stage-muted)]">
                {e.hint}
              </span>
            </label>
          ))}
        </div>
        <ErrorText id={`${uid}-exp-err`}>{errors.experience?.message}</ErrorText>
      </fieldset>

      <div className="mt-8">
        <label htmlFor={`${uid}-why`} className="mono-label block pb-2.5">
          Why do you want to join?
        </label>
        <textarea
          id={`${uid}-why`}
          rows={4}
          placeholder="A sentence or two is plenty."
          aria-invalid={!!errors.why}
          aria-describedby={errors.why ? `${uid}-why-err` : undefined}
          className={`${fieldClasses(!!errors.why)} resize-y`}
          {...register("why")}
        />
        <ErrorText id={`${uid}-why-err`}>{errors.why?.message}</ErrorText>
      </div>

      <div className="mt-8">
        <label htmlFor={`${uid}-idea`} className="mono-label block pb-2.5">
          Something you would want to build
          <span className="ml-2 normal-case tracking-normal opacity-50">
            Optional
          </span>
        </label>
        <textarea
          id={`${uid}-idea`}
          rows={3}
          placeholder="Anything. It does not have to be good yet."
          className={`${fieldClasses(!!errors.idea)} resize-y`}
          {...register("idea")}
        />
        <ErrorText id={`${uid}-idea-err`}>{errors.idea?.message}</ErrorText>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2.5 rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform,opacity] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55"
        >
          {status === "sending" && (
            <motion.span
              aria-hidden
              className="block h-3 w-3 rounded-full border-[1.5px] border-ink border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
            />
          )}
          {status === "sending" ? "Sending" : "Send application"}
        </button>

        <AnimatePresence>
          {status === "error" && serverMessage && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
              className="text-sm text-marigold-ink"
            >
              {serverMessage}{" "}
              <a
                href={`mailto:${club.email}`}
                className="underline underline-offset-4"
              >
                Email us instead
              </a>
              .
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
