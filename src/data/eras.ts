export interface Era {
  id: string;
  /** Position in the narrative, starting at 0 for the intro. */
  index: number;
  /** Decades the chapter is anchored in. Null for the framing chapters (intro, finale). */
  period: string | null;
  title: string;
  /** Editorial line the chapter shows. Not a literal historical claim. Null where it shows none. */
  statement: string | null;
  /** Short factual or explanatory sentence shown under it. Null where the chapter shows none. */
  detail: string | null;
  /** What the Persistent Signal motif represents in this chapter. */
  signal: string;
}

/**
 * Narrative order of the experience and all of its copy. Each chapter owns
 * its visual composition in its own section component.
 *
 * Periods name the decades a chapter is anchored in, not exclusive ranges:
 * they overlap on purpose, because the technologies did. The `detail`
 * sentences are the only historical claims on the page; keep them general
 * and defensible, and see the README for what they were checked against.
 */
export const eras = [
  {
    id: "intro",
    index: 0,
    period: null,
    title: "Initialization",
    statement: "An interactive history of computing",
    detail: null,
    signal: "Initialization signal",
  },
  {
    id: "machine",
    index: 1,
    period: "1940s–1950s",
    title: "Machine",
    statement: "Computation becomes physical.",
    detail:
      "Early electronic computers filled entire rooms and switched with vacuum tubes.",
    signal: "Electrical signal",
  },
  {
    id: "chip",
    index: 2,
    period: "1960s–1970s",
    title: "Chip",
    statement: "Miniaturization.",
    detail:
      "Circuits that once filled cabinets were integrated onto a single chip.",
    signal: "Circuit trace",
  },
  {
    id: "personal",
    index: 3,
    period: "1970s–1980s",
    title: "Personal",
    statement: "Computing becomes personal.",
    detail: null,
    signal: "Pixel and interface structure",
  },
  {
    id: "web",
    index: 4,
    period: "1990s",
    title: "Web",
    statement: "Computers become connected.",
    detail:
      "Hypertext linked information across different computers into one shared web.",
    signal: "Network edge",
  },
  {
    id: "always-on",
    index: 5,
    period: "2000s",
    title: "Always On",
    statement: "Connection becomes persistent.",
    detail: "Going online stopped being an event. The link stayed open.",
    signal: "Continuous data flow",
  },
  {
    id: "everywhere",
    index: 6,
    period: "2010s",
    title: "Everywhere",
    statement: "Computing stopped being somewhere. It became everywhere.",
    detail: null,
    signal: "Device boundary",
  },
  {
    id: "intelligence",
    index: 7,
    period: "2020s",
    title: "Intelligence",
    statement: null,
    detail:
      "Software starts to work with language, images, code and sound as patterns it can relate and recombine.",
    signal: "Relationship between tokens",
  },
  {
    id: "finale",
    index: 8,
    period: null,
    title: "What Comes Next?",
    statement: "What comes next?",
    detail: null,
    signal: "Unresolved signal",
  },
] as const satisfies readonly Era[];

export type EraId = (typeof eras)[number]["id"];

/**
 * Bounds of the time axis the Intro opens and the Finale closes with.
 * `start` is the opening of the decade in which electronic computing took
 * shape, not the date of any one machine. `present` is the year the piece
 * was made.
 */
export const TIMELINE = { start: "1940", present: "2026" } as const;
