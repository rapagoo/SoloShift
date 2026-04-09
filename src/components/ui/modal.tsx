"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 backdrop-blur-sm md:items-center">
      <button
        aria-label="닫기"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "grain relative z-10 w-full max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-6 shadow-[var(--shadow-lg)]",
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
              {title}
            </p>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
          <button
            className="rounded-full bg-slate-900/5 px-3 py-1 text-sm text-slate-600"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
