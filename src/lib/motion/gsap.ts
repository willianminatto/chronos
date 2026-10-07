import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins. Client Components import GSAP
 * from here instead of from the packages, so plugins are always registered.
 *
 * Animations belong inside `useGSAP(() => { ... }, { scope })` in the section
 * that owns them: the hook reverts every tween and ScrollTrigger created in
 * its callback when the component unmounts.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
