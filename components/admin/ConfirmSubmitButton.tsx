"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

interface ConfirmSubmitButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  className?: string;
}

// Remplace window.confirm() par une fenêtre habillée aux couleurs du site
// (même famille que DayEditModal/RangeEditModal) — utilisé pour toute
// action qui modifie/supprime des données (règle du projet : confirmer
// avant suppression/modification). `action` est directement la Server
// Action déjà liée à ses arguments (ex. confirmBookingRequest.bind(null,
// id, ...)) : plus besoin d'un <form> englobant, on l'appelle au clic.
export function ConfirmSubmitButton({
  action,
  confirmMessage,
  variant = "primary",
  children,
  className,
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, pending]);

  async function handleConfirm() {
    setPending(true);
    await action();
    setPending(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => !pending && setOpen(false)}
          >
            <div
              className="w-full max-w-sm border border-foreground/15 bg-anthracite-800 p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm text-foreground">{confirmMessage}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={pending}
                  onClick={handleConfirm}
                >
                  {pending ? "…" : "Confirmer"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
