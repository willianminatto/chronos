"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, EASE } from "@/lib/motion/config";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";
import { resolveSignalChain } from "@/lib/motion/signal";
import {
  DRAWING,
  FRAME,
  FRAME_CENTER,
  FRAME_SCALE,
  NetworkGraph,
  OPEN_CLIP,
  ROUTE_LENGTH,
  ROUTE_STOPS,
  WAVES,
} from "./network-graph";
import "./network.css";

/** Width of the widest line of each title in em, at the compressed width. */
const WEB_FIT = { "--fit": 1.52 };
const ALWAYS_ON_FIT = { "--fit": 2.66 };

/** One pin for both chapters, relative to the viewport. */
const PIN_DISTANCE = "+=270%";
/** The pin, plus the viewport the stage enters through and the one it leaves by. */
const LIVE_DISTANCE = "+=470%";

/* Fractions of the pinned scroll range. */
const WAVE_START = 0.05;
const WAVE_STEP = 0.075;
const HANDOVER = 0.45;
const CONVERGE = 0.76;
const EXIT = CONVERGE + 0.1;

const formatIndex = (index: number) => String(index).padStart(2, "0");

const web = eras[4];
const alwaysOn = eras[5];

/**
 * Chapters 04 and 05 share one stage, because the second is not a new
 * structure but a change of behavior in the first.
 *
 * Web: the signal that left the Personal frame reaches a host, the first
 * edge is drawn to a second node, and the network expands in waves while
 * the signal picks a route through it. Always On: the same network starts
 * carrying traffic, group by group, and the signal's route becomes a flow.
 * At the end the network converges into a portrait frame.
 *
 * On desktop this is one pinned timeline. Compact screens, and reduced
 * motion at any size, get two stacked sections with a graph each.
 */
export function Network() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const stage = root.current;
        if (!stage || !conditions || conditions.reduced) return;

        const sections = gsap.utils.toArray<HTMLElement>(
          "[data-network='era']",
        );
        const graphs = gsap.utils.toArray<SVGSVGElement>(
          "[data-network='graph']",
        );
        const graph = graphs[0];
        if (!graph) return;

        const within = (selector: string) =>
          gsap.utils.toArray<SVGElement>(selector, graph);
        const wave = (name: string, index: number) =>
          within(`[data-network='${name}'][data-wave='${index}']`);

        if (!conditions.desktop) {
          sections.forEach((section, index) => {
            const pass = section.querySelector<HTMLElement>(
              "[data-network='pass']",
            );
            const drawing = graphs[index];
            if (!pass || !drawing) return;

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: section,
                  start: `top ${COMPACT_SIGNAL_LINE}`,
                  end: `bottom ${COMPACT_SIGNAL_LINE}`,
                  scrub: true,
                },
              })
              .add(
                resolveSignalChain(
                  [
                    { target: pass, length: pass.offsetHeight },
                    {
                      target: drawing,
                      length: (ROUTE_LENGTH * drawing.clientWidth) / DRAWING,
                    },
                  ],
                  { waits: true },
                ),
              );
          });

          // The Web's network is drawn as it scrolls into view.
          const expansion = gsap.timeline({
            scrollTrigger: {
              trigger: graph,
              start: "top 85%",
              end: "center 50%",
              scrub: true,
            },
          });

          for (let index = 1; index <= WAVES; index += 1) {
            expansion
              .fromTo(
                wave("edge", index),
                { strokeDashoffset: 1 },
                { strokeDashoffset: 0, ease: EASE.linear, duration: 1 },
                index - 1,
              )
              .from(
                wave("node", index),
                { opacity: 0, ease: EASE.linear, duration: 0.2 },
                index - 0.2,
              );
          }

          ScrollTrigger.create({
            trigger: stage,
            start: "top bottom",
            end: "bottom top",
            toggleClass: { targets: stage, className: "is-live" },
          });

          return () => stage.classList.remove("is-live");
        }

        stage.dataset.stage = "merged";

        // The signal reaches the host as the stage arrives.
        gsap.fromTo(
          graph,
          { "--signal-progress": 0 },
          {
            "--signal-progress": ROUTE_STOPS[0],
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
          },
        });

        ScrollTrigger.create({
          trigger: stage,
          start: "top bottom",
          end: LIVE_DISTANCE,
          toggleClass: { targets: stage, className: "is-live" },
        });

        const text = (era: string, part: string) =>
          `[data-era='${era}'] [data-network='${part}']`;

        timeline
          .from(text("web", "meta"), { opacity: 0, duration: 0.04 }, 0)
          .from(
            text("web", "title"),
            { yPercent: 100, ease: EASE.primary, duration: 0.1 },
            0,
          )
          .from(text("web", "copy"), { opacity: 0, duration: 0.05 }, 0.06);

        // Web: one edge, a second node, then wave after wave. The signal
        // advances one node of its route with each of the first waves.
        for (let index = 1; index <= WAVES; index += 1) {
          const start = WAVE_START + (index - 1) * WAVE_STEP;

          timeline
            .fromTo(
              wave("edge", index),
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: WAVE_STEP * 0.8 },
              start,
            )
            .from(
              wave("node", index),
              {
                scale: 0,
                transformOrigin: "50% 50%",
                ease: EASE.primary,
                duration: WAVE_STEP * 0.5,
              },
              start + WAVE_STEP * 0.6,
            );

          const stop = ROUTE_STOPS[index];
          if (stop !== undefined) {
            timeline.fromTo(
              graph,
              { "--signal-progress": ROUTE_STOPS[index - 1] },
              {
                "--signal-progress": stop,
                ease: EASE.linear,
                duration: WAVE_STEP * 0.8,
                immediateRender: false,
              },
              start,
            );
          }
        }

        // Always On: the structure stays, the titles change, traffic starts.
        timeline
          .to(
            [text("web", "meta"), text("web", "copy")],
            { opacity: 0, duration: 0.04 },
            HANDOVER,
          )
          .to(
            text("web", "title"),
            { yPercent: -100, duration: 0.08 },
            HANDOVER,
          )
          .from(
            [text("always-on", "meta"), text("always-on", "copy")],
            { opacity: 0, duration: 0.04 },
            HANDOVER + 0.06,
          )
          .from(
            text("always-on", "title"),
            { yPercent: 100, ease: EASE.primary, duration: 0.1 },
            HANDOVER + 0.04,
          )
          .set(graph, { attr: { "data-flow": "on" } }, HANDOVER + 0.04)
          .from(
            within(".network-route-flow"),
            { opacity: 0, ease: EASE.linear, duration: 0.04 },
            HANDOVER + 0.04,
          );

        [1, 2, 3].forEach((group, index) => {
          timeline.from(
            within(`[data-flow-group='${group}']`),
            { opacity: 0, ease: EASE.linear, duration: 0.04 },
            HANDOVER + 0.06 + index * 0.09,
          );
        });

        // The network stops being an outside structure: a frame closes in
        // on it, it shrinks to fit, and the signal leaves through the frame.
        timeline
          .fromTo(
            within("[data-network='clip']"),
            { attr: { ...OPEN_CLIP } },
            { attr: { ...FRAME }, duration: 0.14 },
            CONVERGE,
          )
          .to(
            within("[data-network='field']"),
            { scale: FRAME_SCALE, svgOrigin: FRAME_CENTER, duration: 0.14 },
            CONVERGE,
          )
          // Lines keep their weight on screen while the drawing shrinks.
          .to(
            within("[data-network='field']"),
            {
              "--network-hairline": () =>
                Number.parseFloat(
                  getComputedStyle(graph).getPropertyValue("--network-hairline"),
                ) / FRAME_SCALE,
              duration: 0.14,
            },
            CONVERGE,
          )
          .to(
            within("[data-network='frame']"),
            { strokeDashoffset: 0, duration: 0.1 },
            CONVERGE + 0.02,
          )
          .fromTo(
            graph,
            { "--signal-progress": ROUTE_STOPS[ROUTE_STOPS.length - 1] },
            {
              "--signal-progress": 1,
              ease: EASE.linear,
              duration: 0.1,
              immediateRender: false,
            },
            CONVERGE,
          )
          .set(within("[data-network='exit']"), { visibility: "visible" }, EXIT)
          .fromTo(
            graph,
            { "--network-exit": 0 },
            { "--network-exit": 1, ease: EASE.linear, duration: 0.1 },
            EXIT,
          );

        return () => {
          delete stage.dataset.stage;
          stage.classList.remove("is-live");
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="network">
      <section
        data-network="era"
        data-era="web"
        aria-labelledby="web-title"
        className="network-era"
      >
        <TechnicalGrid />
        <div className="network-era__text">
          <SignalLine
            data-network="pass"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 lg:hidden"
          />
          <div className="network-labels">
            <TechnicalLabel data-network="meta">
              Era / <span className="text-accent">{formatIndex(web.index)}</span>
            </TechnicalLabel>
            <TechnicalLabel data-network="meta">{web.period}</TechnicalLabel>
          </div>
          <StructuralLine className="-mx-rail lg:hidden" />
          <div className="network-title-box @container mt-block lg:mt-0">
            <h2
              id="web-title"
              data-network="title"
              className="network-title -ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase font-stretch-[62%] lg:font-stretch-[125%]"
              style={WEB_FIT}
            >
              {web.title}
            </h2>
          </div>
          <div data-network="copy" className="network-copy">
            <p className="text-heading font-semibold font-stretch-[125%] uppercase lg:text-xl">
              {web.statement}
            </p>
            <p className="max-w-[38ch] text-body text-muted">
              {web.detail}
            </p>
          </div>
        </div>
        <div aria-hidden className="network-figure">
          <NetworkGraph id="web-network" flow="off" />
        </div>
      </section>

      <section
        data-network="era"
        data-era="always-on"
        aria-labelledby="always-on-title"
        className="network-era network-era--always-on"
      >
        <div className="network-era__text">
          <SignalLine
            data-network="pass"
            data-signal-pending
            orientation="vertical"
            track={false}
            ends={false}
            relay
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 lg:hidden"
          />
          <div className="network-labels">
            <TechnicalLabel data-network="meta">
              Era /{" "}
              <span className="text-accent">{formatIndex(alwaysOn.index)}</span>
            </TechnicalLabel>
            <TechnicalLabel data-network="meta">{alwaysOn.period}</TechnicalLabel>
          </div>
          <StructuralLine className="-mx-rail lg:hidden" />
          <div className="network-title-box @container mt-block lg:mt-0">
            <h2
              id="always-on-title"
              data-network="title"
              className="network-title -ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase font-stretch-[62%]"
              style={ALWAYS_ON_FIT}
            >
              Always
              <br />
              On
            </h2>
          </div>
          <div data-network="copy" className="network-copy">
            <p className="text-heading font-semibold font-stretch-[125%] uppercase lg:text-xl">
              {alwaysOn.statement}
            </p>
            <p className="max-w-[38ch] text-body text-muted">
              {alwaysOn.detail}
            </p>
          </div>
        </div>
        <div aria-hidden className="network-figure">
          <NetworkGraph id="always-on-network" flow="on" />
        </div>
      </section>
    </div>
  );
}
