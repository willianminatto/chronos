import type { ComponentProps } from "react";

interface TechnicalGridProps
  extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {
  /** `sparse` shows the main divisions only; `full` shows every column. */
  density?: "sparse" | "full";
}

/**
 * Decorative overlay that makes the layout grid visible. Fills its nearest
 * positioned ancestor and aligns with `.chronos-grid` columns.
 */
export function TechnicalGrid({
  density = "sparse",
  className = "",
  ...props
}: TechnicalGridProps) {
  return (
    <div
      {...props}
      aria-hidden
      data-density={density}
      className={`technical-grid ${className}`}
    />
  );
}
