"use client";

import { useRef } from "react";
import {
  DRAWING,
  FRAME as NETWORK_FRAME,
} from "@/components/sections/network/network-graph";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, EASE } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { offsetWithin } from "@/lib/motion/layout";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";
import { resolveSignalChain } from "@/lib/motion/signal";
import "./ambient.css";

/** Width of each title in em, measured the same way as the Intro title. */
const EVERYWHERE_FIT = {
  "--fit-compressed": 4.6,
  "--fit-extended": 8.96,
};
const INTELLIGENCE_FIT = {
  "--fit-compressed": 4.79,
  "--fit-extended": 9.23,
};

/** Editorial categories, not measurements. One per block of the frame. */
const TOKENS = ["Language", "Vision", "Code", "Sound"];
/** The title in as many pieces as there are tokens: each one brings a part. */
const FRAGMENTS = ["Int", "ell", "ige", "nce"];
/** Horizontal position of each token, as a share of the row. */
const TOKEN_POSITIONS = TOKENS.map(
  (_, index) => `${((index + 0.5) / TOKENS.length) * 100}%`,
);

/** One pin for both chapters, relative to the viewport. */
const PIN_DISTANCE = "+=290%";

/* Fractions of the pinned scroll range. */
const MORPH = { wide: 0.06, medium: 0.2, hand: 0.32, duration: 0.1 };
const DISSOLVE = 0.44;
const RELATE = 0.55;
const RELEASE = 0.84;

const formatIndex = (index: number) => String(index).padStart(2, "0");

const everywhere = eras[6];
const intelligence = eras[7];

/**
 * Chapters 06 and 07 share one stage.
 *
 * Everywhere: the portrait frame the network ended in arrives, the signal
 * lights its border, and it changes proportion — wide, medium, hand — while
 * its content reflows and each past proportion stays behind as an outline.
 * Then the frame stops mattering: its border dissolves and the four blocks
 * it held leave it.
 *
 * Intelligence: the blocks become tokens. The signal, until now one path,
 * divides to reach all four and runs on in parallel into the title, which
 * each token completes with one fragment. Then everything is released, and
 * a single line is left to carry on.
 *
 * On desktop this is one pinned timeline. Compact screens, and reduced
 * motion at any size, get two stacked sections in their final state.
 */
export function Ambient() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const stage = root.current;
        if (!stage || !conditions || conditions.reduced) return;

        const one = <T extends Element = HTMLElement>(name: string) =>
          stage.querySelector<T>(`[data-ambient='${name}']`);
        const all = (name: string) =>
          gsap.utils.toArray<HTMLElement>(`[data-ambient='${name}']`);

        const entry = one("entry");
        const border = one("border");
        const fanOut = one<SVGSVGElement>("fan-out");
        const fanIn = one<SVGSVGElement>("fan-in");
        if (!entry || !border || !fanOut || !fanIn) return;

        if (!conditions.desktop) {
          const pass = one("pass");
          const exit = one("exit");
          const frame = one("frame");
          const head = one("head-line");
          const tail = one("tail-line");
          if (!pass || !exit || !frame || !head || !tail) return;

          const everywhereSection = one("everywhere");
          const intelligenceSection = one("intelligence");

          gsap
            .timeline({
              scrollTrigger: {
                trigger: everywhereSection,
                start: `top ${COMPACT_SIGNAL_LINE}`,
                end: `bottom ${COMPACT_SIGNAL_LINE}`,
                scrub: true,
              },
            })
            .add(
              resolveSignalChain(
                [
                  { target: pass, length: pass.offsetHeight },
                  { target: entry, length: entry.offsetHeight },
                  {
                    target: border,
                    length: frame.offsetHeight + frame.offsetWidth / 2,
                  },
                  { target: exit, length: exit.offsetHeight },
                ],
                { waits: true },
              ),
            );

          // The boundaries appear from the widest to the narrowest.
          gsap
            .timeline({
              defaults: { ease: EASE.linear },
              scrollTrigger: {
                trigger: frame,
                start: "top 85%",
                end: "top 45%",
                scrub: true,
              },
            })
            .from(all("ghost"), { opacity: 0, duration: 1, stagger: 1 })
            .from(frame, { opacity: 0, duration: 1 });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: intelligenceSection,
                start: `top ${COMPACT_SIGNAL_LINE}`,
                end: `bottom ${COMPACT_SIGNAL_LINE}`,
                scrub: true,
              },
            })
            .add(
              resolveSignalChain(
                [
                  { target: head, length: head.offsetHeight },
                  { target: fanOut, length: fanOut.clientHeight },
                  { target: fanIn, length: fanIn.clientHeight },
                  { target: tail, length: tail.offsetHeight },
                ],
                { waits: true },
              ),
            );

          gsap.from(all("fragment"), {
            clipPath: "inset(100% 0% 0% 0%)",
            yPercent: 30,
            ease: EASE.primary,
            duration: 0.7,
            stagger: 0.12,
            scrollTrigger: {
              trigger: one("word"),
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          return;
        }

        const frame = one("frame");
        const hub = one("hub");
        const descent = one("descent");
        const [ghostWide, ghostMedium] = all("ghost");
        const blocks = all("block");
        const tokens = all("token");
        const fragments = all("fragment");
        if (!frame || !hub || !descent || !ghostWide || !ghostMedium) return;

        stage.dataset.stage = "merged";

        // The frame's own CSS size is the hand proportion it ends in.
        const hand = { width: frame.offsetWidth, height: frame.offsetHeight };
        // It arrives with the size the network's frame had.
        const arriving = (side: "width" | "height") =>
          (stage.offsetHeight * NETWORK_FRAME[side]) / DRAWING;
        const center = (element: HTMLElement) => {
          const { x, y } = offsetWithin(element, stage);
          return {
            x: x + element.offsetWidth / 2,
            y: y + element.offsetHeight / 2,
          };
        };

        // The signal reaches the frame as the stage arrives.
        gsap.fromTo(
          entry,
          { "--signal-progress": 0 },
          {
            "--signal-progress": 1,
            ease: EASE.linear,
            scrollTrigger: {
              trigger: stage,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );

        // Positions and durations below are fractions of the scroll range.
        const timeline = gsap.timeline({
          defaults: { ease: EASE.expressive },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: PIN_DISTANCE,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const text = (era: string, part: string) =>
          `[data-era='${era}'] [data-ambient='${part}']`;

        // Everywhere: the signal becomes the boundary, the boundary morphs.
        timeline
          .set(hub, { visibility: "visible" }, 0.005)
          .fromTo(
            border,
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.08 },
            0,
          )
          .from(text("everywhere", "meta"), { opacity: 0, duration: 0.04 }, 0)
          .from(
            text("everywhere", "title"),
            { yPercent: 100, ease: EASE.primary, duration: 0.1 },
            0,
          )
          .from(text("everywhere", "copy"), { opacity: 0, duration: 0.05 }, 0.05)
          .fromTo(
            frame,
            {
              width: () => arriving("width"),
              height: () => arriving("height"),
            },
            {
              width: () => ghostWide.offsetWidth,
              height: () => ghostWide.offsetHeight,
              duration: MORPH.duration,
            },
            MORPH.wide,
          )
          .from(all("ghost"), { opacity: 0, duration: 0.01 }, MORPH.wide)
          .to(
            frame,
            {
              width: () => ghostMedium.offsetWidth,
              height: () => ghostMedium.offsetHeight,
              duration: MORPH.duration,
            },
            MORPH.medium,
          )
          .to(
            frame,
            { ...hand, duration: MORPH.duration },
            MORPH.hand,
          );

        // The device stops being the center: the frame goes, its content stays.
        timeline
          .to(
            frame,
            {
              borderColor: "transparent",
              backgroundColor: "transparent",
              duration: 0.06,
            },
            DISSOLVE,
          )
          .to(
            [border, one("bar"), ...all("ghost")],
            { opacity: 0, duration: 0.06 },
            DISSOLVE,
          )
          .to(
            [text("everywhere", "meta"), text("everywhere", "copy")],
            { opacity: 0, duration: 0.04 },
            DISSOLVE,
          )
          .to(
            text("everywhere", "title"),
            { yPercent: 100, duration: 0.08 },
            DISSOLVE,
          );

        // Intelligence: each block travels to where its token sits.
        blocks.forEach((block, index) => {
          const token = tokens[index];
          if (!token) return;

          timeline.to(
            block,
            {
              x: () => center(token).x - center(block).x,
              y: () => center(token).y - center(block).y,
              duration: 0.1,
            },
            DISSOLVE,
          );
        });

        timeline
          .to(blocks, { opacity: 0, duration: 0.03 }, DISSOLVE + 0.09)
          .from(tokens, { opacity: 0, duration: 0.03 }, DISSOLVE + 0.09)
          .from(
            text("intelligence", "meta"),
            { opacity: 0, duration: 0.04 },
            DISSOLVE + 0.06,
          )
          // One path becomes four, then four run in parallel into the word.
          .fromTo(
            fanOut,
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.07 },
            RELATE,
          )
          .fromTo(
            fanIn,
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.06 },
            RELATE + 0.07,
          )
          .from(
            fragments,
            {
              clipPath: "inset(100% 0% 0% 0%)",
              yPercent: 30,
              ease: EASE.primary,
              duration: 0.07,
              stagger: 0.03,
            },
            RELATE + 0.11,
          )
          .from(
            text("intelligence", "copy"),
            { opacity: 0, duration: 0.04 },
            RELATE + 0.16,
          );

        // Release: fragments drift apart, relations are withdrawn, tokens go.
        timeline
          .to(
            fragments,
            {
              yPercent: (index) => (index % 2 === 0 ? -60 : 60),
              opacity: 0,
              duration: 0.08,
              stagger: 0.01,
            },
            RELEASE,
          )
          .to(fanIn, { "--signal-progress": 0, duration: 0.05 }, RELEASE)
          .to(fanOut, { "--signal-progress": 0, duration: 0.05 }, RELEASE + 0.03)
          .to(
            [
              ...tokens,
              text("intelligence", "meta"),
              text("intelligence", "copy"),
            ],
            { opacity: 0, duration: 0.04 },
            RELEASE + 0.03,
          )
          // What is left is the signal, on its way to whatever comes next.
          .set(hub, { visibility: "hidden" }, 0.9)
          .set(descent, { visibility: "visible" }, 0.9)
          .fromTo(
            descent,
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.1 },
            0.9,
          );

        return () => {
          delete stage.dataset.stage;
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="ambient">
      <section
        data-ambient="everywhere"
        data-era="everywhere"
        aria-labelledby="everywhere-title"
        className="ambient-era"
      >
        <TechnicalGrid />
        <div className="ambient-everywhere__text">
          <SignalLine
            data-ambient="pass"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 lg:hidden"
          />
          <div className="ambient-labels pb-meta">
            <TechnicalLabel data-ambient="meta">
              Era /{" "}
              <span className="text-accent">
                {formatIndex(everywhere.index)}
              </span>
            </TechnicalLabel>
            <TechnicalLabel data-ambient="meta">
              {everywhere.period}
            </TechnicalLabel>
          </div>
          <StructuralLine className="-mx-rail lg:hidden" />
          <div className="ambient-everywhere__bottom">
            <div className="ambient-solid @container overflow-y-clip">
              <h2
                id="everywhere-title"
                data-ambient="title"
                className="-ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase [--fit:var(--fit-compressed)] font-stretch-[62%] lg:[--fit:var(--fit-extended)] lg:font-stretch-[125%]"
                style={EVERYWHERE_FIT}
              >
                {everywhere.title}
              </h2>
            </div>
            <p
              data-ambient="copy"
              className="ambient-solid text-heading font-semibold font-stretch-[125%] uppercase lg:max-w-[44rem] lg:text-xl"
            >
              {everywhere.statement}
            </p>
          </div>
        </div>

        <div aria-hidden className="ambient-figure">
          <SignalLine
            data-ambient="entry"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="ambient-entry"
          />
          <div className="ambient-stack">
            <div data-ambient="ghost" className="ambient-ghost ambient-ghost--wide" />
            <div
              data-ambient="ghost"
              className="ambient-ghost ambient-ghost--medium"
            />
            <div data-ambient="frame" className="ambient-frame">
              <div
                data-ambient="border"
                data-signal-pending
                className="ambient-frame__signal"
              />
              <div data-ambient="bar" className="ambient-frame__bar" />
              <div className="ambient-frame__blocks">
                {TOKENS.map((token) => (
                  <div
                    key={token}
                    data-ambient="block"
                    className="ambient-block"
                  />
                ))}
              </div>
            </div>
          </div>
          <SignalLine
            data-ambient="exit"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="ambient-exit"
          />
          <span data-ambient="hub" className="ambient-hub" />
          <SignalLine
            data-ambient="descent"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="ambient-descent"
          />
        </div>
      </section>

      <section
        data-ambient="intelligence"
        data-era="intelligence"
        aria-labelledby="intelligence-title"
        className="ambient-era ambient-era--intelligence"
      >
        <div className="ambient-head">
          <SignalLine
            data-ambient="head-line"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
          />
          <div className="ambient-labels">
            <TechnicalLabel data-ambient="meta">
              Era /{" "}
              <span className="text-accent">
                {formatIndex(intelligence.index)}
              </span>
            </TechnicalLabel>
            <TechnicalLabel data-ambient="meta">
              {intelligence.period}
            </TechnicalLabel>
          </div>
        </div>

        <div className="ambient-diamond">
          <svg
            aria-hidden
            data-ambient="fan-out"
            data-signal-pending
            className="ambient-fan ambient-fan--out"
          >
            {TOKEN_POSITIONS.map((x) => (
              <line key={x} pathLength={1} x1="50%" y1="0" x2={x} y2="100%" />
            ))}
          </svg>
          <ul className="ambient-tokens">
            {TOKENS.map((token) => (
              <li key={token} data-ambient="token" className="ambient-token">
                <TechnicalLabel size="micro" tone="foreground">
                  {token}
                </TechnicalLabel>
              </li>
            ))}
          </ul>
          <svg
            aria-hidden
            data-ambient="fan-in"
            data-signal-pending
            className="ambient-fan ambient-fan--in"
          >
            {TOKEN_POSITIONS.map((x) => (
              <line key={x} pathLength={1} x1={x} y1="0" x2={x} y2="100%" />
            ))}
          </svg>
          <div className="@container">
            <h2
              id="intelligence-title"
              data-ambient="word"
              className="ambient-word -ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase [--fit:var(--fit-compressed)] font-stretch-[62%] lg:[--fit:var(--fit-extended)] lg:font-stretch-[125%]"
              style={INTELLIGENCE_FIT}
            >
              {FRAGMENTS.map((fragment) => (
                <span key={fragment} data-ambient="fragment">
                  {fragment}
                </span>
              ))}
            </h2>
          </div>
        </div>

        <div className="ambient-tail">
          <SignalLine
            data-ambient="tail-line"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
          />
          <p
            data-ambient="copy"
            className="ambient-solid max-w-[38ch] text-body text-muted"
          >
            {intelligence.detail}
          </p>
        </div>
      </section>
    </div>
  );
}
