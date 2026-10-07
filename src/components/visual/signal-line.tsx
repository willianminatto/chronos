import type { ComponentProps } from "react";

interface SignalLineProps
  extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {
  /** A vertical segment needs a definite height, e.g. absolute with insets. */
  orientation?: "horizontal" | "vertical";
  /** How far the signal has resolved, from 0 to 1. Defaults to 1. */
  progress?: number;
  /** Draws the unresolved dashed track under the trace. */
  track?: boolean;
  /** Draws the accent node at the leading end of the trace. */
  head?: boolean;
  /** Hides the head once fully resolved, because another segment continues. */
  relay?: boolean;
  /** Sends a recurring pulse along a horizontal trace. Off under reduced motion. */
  pulse?: boolean;
}

/**
 * One straight segment of the Persistent Signal, with an origin and a
 * terminal node. Decorative. To animate it, tween `--signal-progress` on the
 * root element.
 */
export function SignalLine({
  orientation = "horizontal",
  progress,
  track = true,
  head = true,
  relay = false,
  pulse = false,
  className = "",
  style,
  ...props
}: SignalLineProps) {
  const vertical = orientation === "vertical";

  return (
    <div
      {...props}
      aria-hidden
      data-relay={relay ? "" : undefined}
      className={`signal-line ${vertical ? "signal-line--vertical" : ""} ${className}`}
      style={
        progress === undefined
          ? style
          : { ...style, "--signal-progress": progress }
      }
    >
      {track ? <span className="signal-line__track" /> : null}
      <span className="signal-line__trace" />
      {pulse && !vertical ? <span className="signal-line__pulse" /> : null}
      <span className="signal-line__node" />
      <span className="signal-line__node signal-line__node--terminal" />
      {head ? (
        <span className="signal-line__node signal-line__node--head" />
      ) : null}
    </div>
  );
}
