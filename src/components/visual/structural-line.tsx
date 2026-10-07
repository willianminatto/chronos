import type { ComponentProps } from "react";

interface StructuralLineProps
  extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {
  orientation?: "horizontal" | "vertical";
  tone?: "default" | "strong";
}

const ORIENTATION_CLASSES = {
  horizontal: "h-px",
  vertical: "h-full w-px",
} as const;

const TONE_CLASSES = {
  default: "bg-line",
  strong: "bg-line-strong",
} as const;

/** Decorative one-pixel rule: divider, guide or edge of a composition. */
export function StructuralLine({
  orientation = "horizontal",
  tone = "default",
  className = "",
  ...props
}: StructuralLineProps) {
  return (
    <div
      {...props}
      aria-hidden
      className={`${ORIENTATION_CLASSES[orientation]} ${TONE_CLASSES[tone]} ${className}`}
    />
  );
}
