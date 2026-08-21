import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-sm px-8 py-4 text-sm tracking-[0.14em] uppercase transition-[background-color,border-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ember-600 disabled:hover:translate-y-0";
  const variants = {
    primary: "bg-ember-600 text-white hover:bg-ember-500 hover:-translate-y-0.5",
    secondary:
      "bg-transparent text-foreground border border-foreground/30 hover:border-wood-500 hover:bg-wood-900/10",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
