export interface AssetCredit {
  /** Path of the local file, relative to `public/`. */
  file: string;
  title: string;
  /** Name of the archive, collection or site the asset came from. */
  source: string;
  sourceUrl: string;
  author: string;
  /** License identifier or status, e.g. "CC BY 4.0" or "Public domain". */
  license: string;
  licenseUrl: string | null;
  /** Description of edits made to the original, or null if used unmodified. */
  modifications: string | null;
}

/** Every external asset must be listed here. The MVP ships none. */
export const credits: readonly AssetCredit[] = [];
