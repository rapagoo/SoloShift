"use client";

import { useFormStatus } from "react-dom";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormSubmitButtonProps extends ButtonProps {
  idleLabel: string;
  pendingLabel?: string;
}

export function FormSubmitButton({
  className,
  idleLabel,
  pendingLabel = "처리 중...",
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-busy={pending}
      className={cn("min-w-[8.5rem] gap-2", className)}
      disabled={pending || props.disabled}
      {...props}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span>{pendingLabel}</span>
        </>
      ) : (
        idleLabel
      )}
    </Button>
  );
}
