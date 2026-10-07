import type { ComponentProps } from "react";

type StructuralLineProps = Omit<
  ComponentProps<"div">,
  "children" | "aria-hidden"
>;

/** Decorative one-pixel horizontal rule: divider or edge of a composition. */
export function StructuralLine({
  className = "",
  ...props
}: StructuralLineProps) {
  return (
    <div {...props} aria-hidden className={`h-px bg-line-strong ${className}`} />
  );
}
