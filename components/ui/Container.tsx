import type { ReactNode } from "react";

export function Container({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full px-4 ${wide ? "max-w-4xl" : "max-w-3xl"}`}>
      {children}
    </div>
  );
}
