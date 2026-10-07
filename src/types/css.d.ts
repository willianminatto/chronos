import "react";

declare module "react" {
  // Allows CSS custom properties in the `style` prop without casting.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
