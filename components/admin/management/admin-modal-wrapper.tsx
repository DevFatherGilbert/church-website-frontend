"use client";

import React, { ReactNode, useEffect } from "react";
import { X, LucideIcon } from "lucide-react";

interface AdminModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string; // e.g. "max-w-2xl", "max-w-3xl", "max-w-4xl"
  disabled?: boolean;
}

export function AdminModalWrapper({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  headerActions,
  children,
  footer,
  maxWidth = "max-w-3xl",
  disabled = false,
}: AdminModalWrapperProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disabled) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, disabled]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !disabled) {
          onClose();
        }
      }}
    >
      <div
        aria-modal="true"
        className={`relative flex flex-col max-h-[92vh] w-full ${maxWidth} rounded-3xl border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200`}
        role="dialog"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 sm:px-8 py-5 backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0 pr-4">
            {Icon && (
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-xs">
                <Icon className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {title}
                </h2>
                {badge && (
                  <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              aria-label="Close dialog"
              className="grid size-10 place-items-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 hover:rotate-90"
              disabled={disabled}
              onClick={onClose}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1 text-slate-900">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-slate-50/90 px-6 sm:px-8 py-4 backdrop-blur-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

