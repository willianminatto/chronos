import type { HTMLAttributes } from "react";

interface TechnicalLabelProps extends HTMLAttributes<HTMLElement> {
  as?: "span" | "p";
  size?: "technical" | "micro";
  tone?: "muted" | "foreground" | "accent";
}

const SIZE_CLASSES = {
  technical: "text-technical",
  micro: "text-micro",
} as const;

const TONE_CLASSES = {
  muted: "text-muted",
  foreground: "text-foreground",
  accent: "text-accent",
} as const;

/** Monospaced metadata: dates, indices, identifiers, states. Real text. */
export function TechnicalLabel({
  as: Tag = "span",
  size = "technical",
  tone = "muted",
  className = "",
  ...props
}: TechnicalLabelProps) {
  return (
    <Tag
      {...props}
      className={`font-mono uppercase ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className}`}
    />
  );
}
