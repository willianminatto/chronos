import { EASE } from "./config";
import { gsap } from "./gsap";

interface SignalSegment {
  /** Element that carries `--signal-progress` and contains the head. */
  target: Element;
  /** Any unit, as long as every segment of the chain uses the same one. */
  length: number;
}

/** Time a head takes to appear, in the chain's length unit. */
const HEAD_HANDOVER = 1;

/**
 * Timeline that resolves consecutive signal segments one after another at a
 * constant speed. Its duration is the total length: rescale it with
 * `.duration()` before adding it to a chapter timeline.
 *
 * Only one head shows at a time: every segment after the first keeps its
 * head hidden until the previous one has resolved. The first is left alone
 * by default, because it takes over from whatever came before the chain.
 * Pass `waits` when the chain starts the moment the previous one ends, as on
 * compact screens: its first head then stays hidden until the chain moves.
 */
export function resolveSignalChain(
  segments: SignalSegment[],
  { waits = false } = {},
) {
  const chain = gsap.timeline({ defaults: { ease: EASE.linear } });

  segments.forEach(({ target, length }, index) => {
    const head = target.querySelector("[data-signal-head]");

    // Visibility, not opacity: a relay segment's own opacity rule must keep
    // working once this head has been shown.
    if ((index > 0 || waits) && head) {
      chain.fromTo(
        head,
        { visibility: "hidden" },
        { visibility: "inherit", duration: HEAD_HANDOVER },
        ">",
      );
    }

    chain.fromTo(
      target,
      { "--signal-progress": 0 },
      { "--signal-progress": 1, duration: length },
      ">",
    );
  });

  return chain;
}
