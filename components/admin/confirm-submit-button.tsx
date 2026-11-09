"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = ComponentProps<typeof Button> & {
  confirmation: string;
};

export function ConfirmSubmitButton({ confirmation, onClick, ...props }: ConfirmSubmitButtonProps) {
  return (
    <Button
      type="submit"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
    />
  );
}
