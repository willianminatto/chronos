import type { ComponentProps } from "react";

type TechnicalGridProps = Omit<
  ComponentProps<"div">,
  "children" | "aria-hidden"
>;

/**
 * Decorative overlay that shows the main divisions of the layout grid. Fills
 * its nearest positioned ancestor and aligns with `.chronos-grid` columns.
 */
export function TechnicalGrid({ className = "", ...props }: TechnicalGridProps) {
  return <div {...props} aria-hidden className={`technical-grid ${className}`} />;
}
