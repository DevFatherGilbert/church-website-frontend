"use client";

import { useState } from "react";
import { useForm, type FieldPath, type SubmitHandler } from "react-hook-form";
import { submitInquiry } from "@/lib/api/church-api";
import { submissionSchema, type SubmissionValues } from "@/lib/validation/form-schema";

type SubmissionType = "contact" | "visitor" | "prayer";

export function SubmissionForm({ type = "contact", compact = false, initialMessage = "" }: { type?: SubmissionType; compact?: boolean; initialMessage?: string }) {
  const [status, setStatus] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  const { register, handleSubmit, setError, setFocus, clearErrors, reset, formState: { errors, isSubmitting } } = useForm<SubmissionValues>({
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "", message: initialMessage },
  });

  const submit: SubmitHandler<SubmissionValues> = async (values) => {
    setStatus(null);
    const result = submissionSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldPath<SubmissionValues>;
        setError(field, { type: "validate", message: issue.message });
      }
      const firstField = result.error.issues[0]?.path[0] as FieldPath<SubmissionValues> | undefined;
      if (firstField) setFocus(firstField);
      return;
    }

    clearErrors();
    try {
      await submitInquiry(type, result.data);
      setStatus({ kind: "success", message: "Thank you. Your message has been sent to the church team." });
      reset({ name: "", email: "", phone: "", message: "" });
    } catch (cause) {
      setStatus({
        kind: "error",
        message: cause instanceof Error ? cause.message : "Your message could not be sent. Please try again.",
      });
    }
  };

  const messageLabel = type === "prayer" ? "Prayer request" : type === "visitor" ? "Anything you’d like us to know before you visit?" : "How can we help?";
  const fieldClass = (field: FieldPath<SubmissionValues>) => `form-field mt-2 ${errors[field] ? "border-error" : ""}`;
  const fieldDescription = (field: FieldPath<SubmissionValues>) => errors[field] ? `${type}-${field}-error` : undefined;

  return <form className={compact ? "space-y-4" : "space-y-5"} noValidate onSubmit={handleSubmit(submit)}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold" htmlFor={`${type}-name`}>Your name
        <input {...register("name")} aria-describedby={fieldDescription("name")} aria-invalid={Boolean(errors.name)} aria-required="true" autoComplete="name" className={fieldClass("name")} id={`${type}-name`} maxLength={140} />
        {errors.name?.message && <span className="mt-1 block text-sm text-error" id={`${type}-name-error`} role="alert">{errors.name.message}</span>}
      </label>
      <label className="block text-sm font-semibold" htmlFor={`${type}-email`}>Email address
        <input {...register("email")} aria-describedby={fieldDescription("email")} aria-invalid={Boolean(errors.email)} aria-required="true" autoComplete="email" className={fieldClass("email")} id={`${type}-email`} maxLength={254} type="email" />
        {errors.email?.message && <span className="mt-1 block text-sm text-error" id={`${type}-email-error`} role="alert">{errors.email.message}</span>}
      </label>
    </div>
    <label className="block text-sm font-semibold" htmlFor={`${type}-phone`}>Phone <span className="font-normal text-muted">(optional)</span>
      <input {...register("phone")} aria-describedby={fieldDescription("phone")} aria-invalid={Boolean(errors.phone)} autoComplete="tel" className={fieldClass("phone")} id={`${type}-phone`} maxLength={40} type="tel" />
      {errors.phone?.message && <span className="mt-1 block text-sm text-error" id={`${type}-phone-error`} role="alert">{errors.phone.message}</span>}
    </label>
    <label className="block text-sm font-semibold" htmlFor={`${type}-message`}>{messageLabel}
      <textarea {...register("message")} aria-describedby={fieldDescription("message")} aria-invalid={Boolean(errors.message)} aria-required="true" className={`${fieldClass("message")} min-h-32 resize-y`} id={`${type}-message`} maxLength={5000} />
      {errors.message?.message && <span className="mt-1 block text-sm text-error" id={`${type}-message-error`} role="alert">{errors.message.message}</span>}
    </label>
    {type === "prayer" && <p className="text-xs leading-5 text-muted">Prayer requests are personal. Share only what you are comfortable sending to the church team.</p>}
    <button className="button button-primary disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Sending…" : type === "prayer" ? "Share request" : "Send message"}<span aria-hidden="true">↗</span></button>
    {status && <p className={`text-sm ${status.kind === "error" ? "text-error" : "text-success"}`} aria-live={status.kind === "error" ? "assertive" : "polite"} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p>}
  </form>;
}
