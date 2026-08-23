"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  createPricingRule,
  deletePricingRule,
  updatePricingRule,
} from "@/app/admin/(protected)/actions/pricing";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { PricingRuleFields } from "./PricingRuleFields";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

interface PricingRuleModalProps {
  // null = fermée, "new" = création, une règle = modification.
  target: PricingRule | "new" | null;
  onClose: () => void;
}

// Formulaire complet d'un tarif, en fenêtre plutôt qu'en bloc toujours
// ouvert dans la liste — on ne le voit que pour créer ou modifier un
// tarif précis, la liste reste compacte le reste du temps.
export function PricingRuleModal({ target, onClose }: PricingRuleModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!target) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [target, onClose, pending]);

  if (!mounted || !target) return null;

  const isNew = target === "new";
  const rule = isNew ? undefined : target;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    if (isNew) {
      await createPricingRule(formData);
    } else if (rule) {
      await updatePricingRule(rule.id, formData);
    }
    setPending(false);
    onClose();
  }

  async function handleDelete() {
    if (!rule) return;
    await deletePricingRule(rule.id);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={() => !pending && onClose()}
    >
      <div
        className="w-full max-w-lg border border-foreground/15 bg-anthracite-800 p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-xl text-foreground">
          {isNew ? "Ajouter un tarif" : "Modifier le tarif"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <PricingRuleFields defaultValues={rule} />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "…" : "Enregistrer"}
            </Button>
            {!isNew && rule && (
              <ConfirmSubmitButton
                action={handleDelete}
                confirmMessage={`Supprimer le tarif "${rule.label}" ?`}
                variant="secondary"
              >
                Supprimer
              </ConfirmSubmitButton>
            )}
            <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
