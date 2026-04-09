"use client";

import { useFormStatus } from "react-dom";

import { Button, ButtonProps } from "@/components/ui/button";

interface FormSubmitButtonProps extends ButtonProps {
  idleLabel: string;
  pendingLabel?: string;
}

export function FormSubmitButton({
  idleLabel,
  pendingLabel = "저장 중...",
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || props.disabled} {...props}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
