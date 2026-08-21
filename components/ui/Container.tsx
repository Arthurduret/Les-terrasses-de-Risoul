import type { ReactNode } from "react";

export function Container({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}
    >
      {children}
    </div>
  );
}
