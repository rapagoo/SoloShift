"use client";

import { useFormStatus } from "react-dom";

interface FormPendingNoticeProps {
  message?: string;
}

export function FormPendingNotice({
  message = "처리 중입니다. 잠시만 기다려주세요.",
}: FormPendingNoticeProps) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <p aria-live="polite" className="text-sm text-slate-500">
      {message}
    </p>
  );
}
