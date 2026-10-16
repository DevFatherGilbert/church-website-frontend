"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

type ConfirmationOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

type ConfirmationContextValue = (options: ConfirmationOptions) => Promise<boolean>;
const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error("useConfirmation must be used inside ConfirmationDialogProvider");
  return confirm;
}

export function ConfirmationDialogProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  const confirm = useCallback<ConfirmationContextValue>((nextOptions) => {
    return new Promise((resolve) => {
      resolver.current?.(false);
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      resolver.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  const finish = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setOptions(null);
    requestAnimationFrame(() => returnFocusTo.current?.focus());
  }, []);

  useEffect(() => {
    if (!options) return;
    cancelButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = document.getElementById(dialogId);
      const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dialogId, finish, options]);

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) finish(false);
          }}
        >
          <section
            aria-describedby={`${dialogId}-description`}
            aria-labelledby={`${dialogId}-title`}
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25"
            id={dialogId}
            role="alertdialog"
          >
            <div className="p-6 sm:p-7">
              <div className={`grid size-12 place-items-center rounded-2xl ${options.tone === "danger" ? "bg-red-50 text-red-700" : "bg-primary/10 text-primary"}`}>
                <AlertTriangle aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-slate-950" id={`${dialogId}-title`}>
                {options.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 font-normal" id={`${dialogId}-description`}>
                {options.description}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => finish(false)}
                ref={cancelButton}
                type="button"
              >
                {options.cancelLabel ?? "Cancel"}
              </button>
              <button
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${options.tone === "danger" ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600" : "bg-primary hover:bg-primary-hover focus-visible:outline-primary"}`}
                onClick={() => finish(true)}
                type="button"
              >
                {options.confirmLabel ?? "Continue"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
}
