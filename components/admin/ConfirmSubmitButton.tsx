"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";

interface ConfirmSubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  confirmMessage: string;
  variant?: "primary" | "secondary";
}

// Bouton de soumission qui demande confirmation avant de laisser passer le
// submit — utilisé pour toute action qui modifie/supprime des dates ou des
// données (cf. règle du projet : confirmer avant suppression/modification).
export function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
