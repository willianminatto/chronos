"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, DURATION, EASE } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";
import { resolveSignalChain } from "@/lib/motion/signal";
import "./machine.css";

/** Width of "MACHINE" in em, measured the same way as the Intro title. */
const TITLE_FIT = {
  "--fit-compressed": 3.14,
  "--fit-extended": 5.95,
};

const UNIT_VARIANTS = ["tubes", "mesh", "tubes", "slots", "tubes", "mesh"];
const WALL_STYLE = { "--machine-units": UNIT_VARIANTS.length };

/** Scroll distance of the pinned desktop sequence, relative to the viewport. */
const PIN_DISTANCE = "+=190%";
/** The wall is first seen this much larger than it is: structure before object. */
const WALL_ZOOM = 2.6;
/** Final scale of the wall, as it starts to shrink toward the next era. */
const WALL_COMPRESSED = 0.5;

const formatIndex = (index: number) => String(index).padStart(2, "0");

const machine = eras[1];

/**
 * Chapter 01. The signal arrives on the grid's frame line and becomes an
 * electrical path. On desktop the machine enters first, far larger than the
 * viewport; the pinned section zooms out until its full scale is visible,
 * runs the signal through every unit, then compresses it to half, which
 * puts the end of the bus on the center line where the signal leaves.
 * Compact screens scroll past a column of units while the signal follows.
 */
export function Machine() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const section = root.current;
        if (!section || !conditions || conditions.reduced) return;

        const lit = gsap.utils.toArray<HTMLElement>("[data-machine='lit']");

        if (!conditions.desktop) {
          const spine = section.querySelector<HTMLElement>(
            "[data-machine='spine']",
          );
          if (!spine) return;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: spine,
                start: `top ${COMPACT_SIGNAL_LINE}`,
                end: `bottom ${COMPACT_SIGNAL_LINE}`,
                scrub: true,
              },
            })
            .add(
              resolveSignalChain(
                [{ target: spine, length: spine.offsetHeight }],
                { waits: true },
              ),
            );

          lit.forEach((layer) => {
            gsap.fromTo(
              layer,
              { opacity: 0 },
              {
                opacity: 1,
                duration: DURATION.short,
                ease: EASE.primary,
                scrollTrigger: {
                  trigger: layer,
                  start: `center ${COMPACT_SIGNAL_LINE}`,
                  toggleActions: "play none none reverse",
                },
              },
            );
          });

          return;
        }

        // The signal reaches the machine as the section arrives.
        gsap.fromTo(
          "[data-machine='drop']",
          { "--signal-progress": 0 },
          {
            "--signal-progress": 1,
            ease: EASE.linear,
            scrollTrigger: {
              trigger: section,
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
            trigger: section,
            start: "top top",
            end: PIN_DISTANCE,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        const signalStart = 0.4;
        const signalDuration = 0.3;
        const exitStart = 0.9;

        // A relay head hides as soon as its segment resolves. Here the next
        // segment starts later, so each head waits at its end until then.
        const dropHead = "[data-machine='drop'] [data-signal-head]";
        const busHead = "[data-machine='bus'] [data-signal-head]";
        gsap.set([dropHead, busHead], { opacity: 1 });

        timeline
          .fromTo(
            "[data-machine='wall']",
            { "--machine-scale": WALL_ZOOM },
            { "--machine-scale": 1, duration: signalStart },
            0,
          )
          // The text zone clears as the wall settles above it.
          .from(
            "[data-machine='line']",
            { scaleX: 0, transformOrigin: "0% 50%", duration: 0.2 },
            0.3,
          )
          .from(
            "[data-machine='meta']",
            { opacity: 0, duration: 0.08, stagger: 0.03 },
            0.34,
          )
          .from(
            "[data-machine='title']",
            { yPercent: 100, ease: EASE.primary, duration: 0.25 },
            0.32,
          )
          .from(
            "[data-machine='copy']",
            {
              opacity: 0,
              yPercent: 24,
              ease: EASE.primary,
              duration: 0.15,
              stagger: 0.04,
            },
            0.36,
          )
          // The bus has no head until the signal turns into it.
          .set(dropHead, { visibility: "hidden" }, signalStart)
          .fromTo(
            busHead,
            { visibility: "hidden" },
            { visibility: "inherit", ease: EASE.linear, duration: 0.01 },
            signalStart,
          )
          .fromTo(
            "[data-machine='bus']",
            { "--signal-progress": 0 },
            {
              "--signal-progress": 1,
              ease: EASE.linear,
              duration: signalDuration,
            },
            signalStart,
          );

        // Each unit lights up as the head passes its connection to the bus.
        lit.forEach((layer, index) => {
          timeline.fromTo(
            layer,
            { opacity: 0 },
            { opacity: 1, ease: EASE.linear, duration: 0.03 },
            signalStart + (signalDuration * (index + 0.5)) / lit.length,
          );
        });

        // Compressed to half, the bus ends on the center line, where the
        // signal leaves for the next era.
        timeline
          .to(
            "[data-machine='wall']",
            { "--machine-scale": WALL_COMPRESSED, duration: 0.18 },
            0.72,
          )
          .set(busHead, { visibility: "hidden" }, exitStart)
          .fromTo(
            "[data-machine='exit'] [data-signal-head]",
            { visibility: "hidden" },
            { visibility: "inherit", ease: EASE.linear, duration: 0.01 },
            exitStart,
          )
          .fromTo(
            "[data-machine='exit']",
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.1 },
            exitStart,
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="machine-title"
      className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_1fr] overflow-clip lg:grid-rows-[1fr_auto]"
    >
      <TechnicalGrid />
      <SignalLine
        data-machine="spine"
        data-signal-pending
        orientation="vertical"
        track={false}
        ends={false}
        relay
        className="absolute inset-y-0 left-frame -translate-x-1/2 lg:hidden"
      />
      <SignalLine
        data-machine="exit"
        data-signal-pending
        orientation="vertical"
        track={false}
        relay
        className="absolute top-block bottom-0 left-1/2 -translate-x-1/2 max-lg:hidden"
      />

      <div className="relative flex flex-col px-gutter pt-20 pb-block lg:row-start-2 lg:pt-block lg:pb-0">
        <div className="flex items-baseline justify-between pb-meta">
          <TechnicalLabel data-machine="meta">
            Era /{" "}
            <span className="text-accent">{formatIndex(machine.index)}</span>
          </TechnicalLabel>
          <TechnicalLabel data-machine="meta">{machine.period}</TechnicalLabel>
        </div>
        <StructuralLine data-machine="line" className="-mx-rail" />
        <div className="@container overflow-y-clip pt-block lg:order-last lg:pt-meta">
          <h2
            id="machine-title"
            data-machine="title"
            className="-ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase [--fit:var(--fit-compressed)] font-stretch-[62%] lg:[--fit:var(--fit-extended)] lg:font-stretch-[125%]"
            style={TITLE_FIT}
          >
            {machine.title}
          </h2>
        </div>
        <div className="grid gap-x-track gap-y-meta pt-block lg:grid-cols-12">
          <p
            data-machine="copy"
            className="text-heading font-semibold font-stretch-[125%] uppercase lg:col-span-6"
          >
            {machine.statement}
          </p>
          <p
            data-machine="copy"
            className="max-w-[38ch] text-body text-muted lg:col-span-4 lg:col-start-7"
          >
            {machine.detail}
          </p>
        </div>
      </div>

      <div className="relative mx-frame pb-gutter lg:row-start-1 lg:pt-block lg:pb-0">
        <SignalLine
          data-machine="drop"
          data-signal-pending
          orientation="vertical"
          track={false}
          ends={false}
          relay
          className="absolute top-0 left-0 h-block -translate-x-1/2 max-lg:hidden"
        />
        <div
          aria-hidden
          data-machine="wall"
          className="machine-wall lg:-mt-1"
          style={WALL_STYLE}
        >
          <SignalLine
            data-machine="bus"
            data-signal-pending
            relay
            className="max-lg:hidden"
          />
          <div className="machine-units">
            {UNIT_VARIANTS.map((variant, index) => (
              <div key={index} className="machine-unit" data-variant={variant}>
                <span className="machine-label">U/{formatIndex(index + 1)}</span>
                <div className="machine-field" />
                <div
                  data-machine="lit"
                  className="machine-field machine-lit"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
