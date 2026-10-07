export interface Era {
  id: string;
  /** Position in the narrative, starting at 0 for the intro. */
  index: number;
  /** Historical period covered. Null for the framing chapters (intro, finale). */
  period: string | null;
  title: string;
  /** The one-line statement this chapter contributes to the narrative. */
  role: string;
  /** What the Persistent Signal motif represents in this chapter. */
  signal: string;
}

/**
 * Narrative order of the experience. Content metadata only: each chapter owns
 * its visual composition in its own section component.
 */
export const eras = [
  {
    id: "intro",
    index: 0,
    period: null,
    title: "Initialization",
    role: "How did we get here?",
    signal: "Initialization signal",
  },
  {
    id: "machine",
    index: 1,
    period: "1940s–1950s",
    title: "Machine",
    role: "Computing became electronic.",
    signal: "Electrical signal",
  },
  {
    id: "chip",
    index: 2,
    period: "1960s–1970s",
    title: "Chip",
    role: "The machine became small.",
    signal: "Circuit trace",
  },
  {
    id: "personal",
    index: 3,
    period: "1970s–1980s",
    title: "Personal",
    role: "Computers became personal.",
    signal: "Pixel and interface structure",
  },
  {
    id: "web",
    index: 4,
    period: "1990s",
    title: "Web",
    role: "Computers became connected.",
    signal: "Network edge",
  },
  {
    id: "always-on",
    index: 5,
    period: "2000s",
    title: "Always On",
    role: "Connection became persistent.",
    signal: "Continuous data flow",
  },
  {
    id: "everywhere",
    index: 6,
    period: "2010s",
    title: "Everywhere",
    role: "Computing left the desk.",
    signal: "Device boundary",
  },
  {
    id: "intelligence",
    index: 7,
    period: "2020s",
    title: "Intelligence",
    role: "Software learned to generate.",
    signal: "Relationship between tokens",
  },
  {
    id: "finale",
    index: 8,
    period: null,
    title: "What Comes Next?",
    role: "What comes next?",
    signal: "Unresolved signal",
  },
] as const satisfies readonly Era[];

export type EraId = (typeof eras)[number]["id"];
