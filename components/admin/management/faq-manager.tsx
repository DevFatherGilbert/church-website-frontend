"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, HelpCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { authGet, authMutation } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import { ActionSuccessPopup, useActionSuccess } from "./action-success-popup";

const categories = [
  "Church Services",
  "First Visit",
  "Ministries",
  "Prayer",
  "Sermons",
  "Events",
  "Bible Study",
  "Contact & Location",
] as const;

type FaqStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
  status: FaqStatus;
  createdAt?: string;
  updatedAt?: string;
};
type FaqResponse = { items?: Faq[]; total?: number };

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const textAreaClass =
  "mt-2 min-h-36 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function statusStyle(status: FaqStatus) {
  return status === "PUBLISHED"
    ? "admin-badge-published"
    : status === "UNPUBLISHED"
      ? "admin-badge-unpublished"
      : "admin-badge-draft";
}

export function FaqManager() {
  const confirm = useConfirmation();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Faq | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [questionDraft, setQuestionDraft] = useState("");
  const { successData, showSuccess, dismissSuccess } = useActionSuccess();

  const loadFaqs = useCallback(async () => {
    const result = await authGet<FaqResponse>("/admin/faqs");
    setFaqs((result.items ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder));
  }, []);

  useEffect(() => {
    let active = true;
    authGet<FaqResponse>("/admin/faqs")
      .then((result) => {
        if (active) setFaqs((result.items ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load FAQs.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleFaqs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return faqs.filter(
      (faq) =>
        (!category || faq.category === category) &&
        (!status || faq.status === status) &&
        (!term || `${faq.question} ${faq.answer}`.toLocaleLowerCase().includes(term))
    );
  }, [faqs, search, category, status]);

  const canReorder = !search && !category && !status;

  function openEditor(faq?: Faq) {
    setEditing(faq ?? null);
    setPreview(false);
    setAnswerDraft(faq?.answer ?? "");
    setQuestionDraft(faq?.question ?? "");
    setError("");
    setNotice("");
    setEditorOpen(true);
  }

  async function saveFaq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const question = String(form.get("question") ?? "").trim();
    const answer = String(form.get("answer") ?? "").trim();
    const selectedCategory = String(form.get("category") ?? "");
    const nextStatus = String(form.get("status") ?? "DRAFT") as FaqStatus;
    const displayOrder = Number(form.get("displayOrder") ?? 0);

    if (!question || !answer) {
      setError("Add both a question and its approved answer before saving.");
      return;
    }
    if (
      nextStatus === "PUBLISHED" &&
      !(await confirm({
        title: "Publish this FAQ?",
        description: `“${question}” will appear publicly on the church website.`,
        confirmLabel: "Publish FAQ",
      }))
    )
      return;
    if (
      nextStatus === "UNPUBLISHED" &&
      editing?.status === "PUBLISHED" &&
      !(await confirm({
        title: "Unpublish this FAQ?",
        description: `“${question}” will be removed from the public website.`,
        confirmLabel: "Unpublish FAQ",
        tone: "danger",
      }))
    )
      return;
    if (
      nextStatus === "DRAFT" &&
      editing?.status === "PUBLISHED" &&
      !(await confirm({
        title: "Unpublish this FAQ?",
        description: `“${question}” will be removed from the public website and saved as a draft.`,
        confirmLabel: "Save as draft",
        tone: "danger",
      }))
    )
      return;

    setSaving(true);
    setError("");
    try {
      const body = { question, answer, category: selectedCategory || null, status: nextStatus, displayOrder };
      if (editing) await authMutation(`/admin/faqs/${editing.id}`, "PATCH", body);
      else await authMutation("/admin/faqs", "POST", body);
      setEditorOpen(false);
      showSuccess({
        id: editing?.id,
        name: question,
        action: nextStatus === "PUBLISHED" ? "published" : editing ? "updated" : "created",
        message:
          nextStatus === "PUBLISHED"
            ? "This answer is now published on the church website."
            : editing?.status === "PUBLISHED"
              ? "This answer is unpublished and no longer appears on the public website."
            : editing
              ? "FAQ changes saved successfully."
              : "FAQ created successfully.",
      });
      await loadFaqs();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this FAQ.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(faq: Faq) {
    setError("");
    setNotice("");
    const nextStatus = faq.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    if (
      !(await confirm({
        title: nextStatus === "PUBLISHED" ? "Publish this FAQ?" : "Unpublish this FAQ?",
        description:
          nextStatus === "PUBLISHED"
            ? `“${faq.question}” will be visible to visitors.`
            : `“${faq.question}” will be removed from the public website.`,
        confirmLabel: nextStatus === "PUBLISHED" ? "Publish FAQ" : "Unpublish",
        tone: nextStatus === "PUBLISHED" ? "primary" : "danger",
      }))
    )
      return;

    try {
      await authMutation(`/admin/faqs/${faq.id}/status`, "PATCH", { status: nextStatus });
      showSuccess({
        id: faq.id,
        name: faq.question,
        action: nextStatus === "PUBLISHED" ? "published" : "updated",
        message: nextStatus === "PUBLISHED" ? "This answer is now visible to visitors." : "This answer is no longer published.",
      });
      await loadFaqs();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not change FAQ status.");
    }
  }

  async function deleteFaq(faq: Faq) {
    if (
      !(await confirm({
        title: "Delete this FAQ?",
        description: `“${faq.question}” will be permanently deleted. This action cannot be undone.`,
        confirmLabel: "Delete FAQ",
        tone: "danger",
      }))
    )
      return;
    setError("");
    setNotice("");
    try {
      await authMutation(`/admin/faqs/${faq.id}`, "DELETE");
      showSuccess({ id: faq.id, name: faq.question, action: "deleted", message: "FAQ permanently deleted." });
      await loadFaqs();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this FAQ.");
    }
  }

  async function moveFaq(index: number, offset: -1 | 1) {
    const next = faqs.slice();
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFaqs(next);
    try {
      await authMutation("/admin/faqs/reorder", "PATCH", { ids: next.map((faq) => faq.id) });
      setNotice("FAQ display order updated.");
      await loadFaqs();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reorder FAQs.");
      await loadFaqs();
    }
  }

  return (
    <div>
      <ActionSuccessPopup data={successData} onDismiss={dismissSuccess} />
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Church Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">FAQ Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Manage approved answers, organize questions, and control what visitors can see.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
          onClick={() => openEditor()}
          type="button"
        >
          <Plus aria-hidden="true" className="mr-2 size-4" />
          Add FAQ
        </button>
      </header>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </p>
      )}

      <section aria-label="FAQ list" className="admin-card mt-6 overflow-hidden">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_15rem_12rem_auto] lg:items-center lg:p-5">
          <div className="relative">
            <span className="sr-only">Search questions and answers</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className={`${inputClass} mt-0 pl-10`}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions and answers…"
              type="search"
              value={search}
            />
          </div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Category
            <select className={`${inputClass} mt-1`} onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Publication status
            <select className={`${inputClass} mt-1`} onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Unpublished</option>
            </select>
          </label>
          <p aria-live="polite" className="text-xs font-semibold text-muted">
            {visibleFaqs.length} of {faqs.length} FAQ{faqs.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <p className="p-8 text-sm text-muted" role="status">
            Loading FAQs…
          </p>
        ) : visibleFaqs.length ? (
          <div className="divide-y divide-border">
            {visibleFaqs.map((faq) => {
              const index = faqs.findIndex((item) => item.id === faq.id);
              return (
                <article className="p-5 transition hover:bg-surface-strong/50 sm:p-6" key={faq.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`admin-badge ${statusStyle(faq.status)}`}>
                          {faq.status.toLocaleLowerCase()}
                        </span>
                        {faq.category && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2.5 font-display text-base font-bold text-foreground">{faq.question}</h2>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">{faq.answer}</p>
                      <p className="mt-3 text-xs text-muted/80">
                        Updated {dateLabel(faq.updatedAt ?? faq.createdAt)} · Display order {faq.displayOrder + 1}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-start">
                      {canReorder && (
                        <>
                          <button
                            aria-label={`Move “${faq.question}” up`}
                            className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-40"
                            disabled={index === 0}
                            onClick={() => void moveFaq(index, -1)}
                            type="button"
                          >
                            <ArrowUp aria-hidden="true" className="size-4" />
                          </button>
                          <button
                            aria-label={`Move “${faq.question}” down`}
                            className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-40"
                            disabled={index === faqs.length - 1}
                            onClick={() => void moveFaq(index, 1)}
                            type="button"
                          >
                            <ArrowDown aria-hidden="true" className="size-4" />
                          </button>
                        </>
                      )}
                      <button
                        aria-label={`Edit “${faq.question}”`}
                        className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                        onClick={() => openEditor(faq)}
                        type="button"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        aria-label={faq.status === "PUBLISHED" ? `Unpublish “${faq.question}”` : `Publish “${faq.question}”`}
                        className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                        onClick={() => void togglePublished(faq)}
                        type="button"
                      >
                        {faq.status === "PUBLISHED" ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                      </button>
                      <button
                        aria-label={`Delete “${faq.question}”`}
                        className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-red-300 hover:text-red-700"
                        onClick={() => void deleteFaq(faq)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <HelpCircle className="mx-auto size-10 text-muted/60" />
            <h2 className="mt-3 font-display text-base font-bold text-foreground">
              {faqs.length ? "No matching FAQs" : "No FAQs yet"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {faqs.length ? "Try another search or filter." : "Create an FAQ with an approved answer to get started."}
            </p>
            {!faqs.length && (
              <button
                className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover"
                onClick={() => openEditor()}
                type="button"
              >
                <Plus aria-hidden="true" className="mr-1.5 size-4" />
                Add FAQ
              </button>
            )}
          </div>
        )}
      </section>

      {editorOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setEditorOpen(false);
          }}
        >
          <section
            aria-labelledby="faq-editor-title"
            aria-modal="true"
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
              <div className="flex min-w-0 items-center gap-3.5 pr-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-xs">
                  <HelpCircle aria-hidden="true" className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl" id="faq-editor-title">
                      {editing ? "Edit FAQ" : "Create FAQ"}
                    </h2>
                    <span className="hidden items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary sm:inline-flex">
                      {editing ? "Editing" : "New"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">Only publish answers approved by church leadership.</p>
                </div>
              </div>
              <button
                aria-label="Close FAQ editor"
                className="grid size-10 shrink-0 place-items-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-400 transition-all duration-200 hover:rotate-90 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                disabled={saving}
                onClick={() => setEditorOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <form className="flex-1 space-y-5 overflow-y-auto px-6 py-6 text-slate-900 sm:px-8" id="faq-form" key={editing?.id ?? "new-faq"} onSubmit={saveFaq}>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Question <span className="text-red-500">*</span>
                <input
                  className={inputClass}
                  maxLength={180}
                  name="question"
                  onChange={(event) => setQuestionDraft(event.target.value)}
                  required
                  value={questionDraft}
                />
              </label>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted" htmlFor="faq-answer">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <button
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                    onClick={() => setPreview((value) => !value)}
                    type="button"
                  >
                    {preview ? <Pencil aria-hidden="true" className="size-3.5" /> : <Eye aria-hidden="true" className="size-3.5" />}
                    {preview ? "Edit Answer" : "Preview"}
                  </button>
                </div>
                {preview ? (
                  <>
                    <div className="mt-2 min-h-36 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="font-display font-bold text-foreground">{questionDraft || "Your FAQ question will appear here."}</p>
                      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                        {answerDraft || "Your approved answer will appear here."}
                      </p>
                    </div>
                    <input name="answer" type="hidden" value={answerDraft} />
                  </>
                ) : (
                  <textarea
                    className={textAreaClass}
                    id="faq-answer"
                    maxLength={10000}
                    name="answer"
                    onChange={(event) => setAnswerDraft(event.target.value)}
                    required
                    value={answerDraft}
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Category
                  <select className={inputClass} defaultValue={editing?.category ?? ""} name="category">
                    <option value="">No category</option>
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Status
                  <select className={inputClass} defaultValue={editing?.status ?? "DRAFT"} name="status">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="UNPUBLISHED">Unpublished</option>
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Display order
                  <input
                    className={inputClass}
                    defaultValue={editing?.displayOrder ?? faqs.length}
                    min={0}
                    max={100000}
                    name="displayOrder"
                    type="number"
                  />
                </label>
              </div>

              <p className="text-xs leading-relaxed text-muted">
                Answers are saved as plain text. HTML is rejected to keep visitor content safe.
              </p>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                  {error}
                </p>
              )}

              <div className="sticky bottom-0 z-20 -mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:flex-row sm:justify-end sm:px-8">
                <button
                  className="min-h-11 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
                  disabled={saving}
                  onClick={() => setEditorOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Create FAQ"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
