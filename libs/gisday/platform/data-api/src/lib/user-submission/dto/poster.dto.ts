/** A poster as the public gallery shows it: nothing that identifies or contacts its authors beyond their names. */
export interface PosterDto {
  title: string | null;
  /** Each author's name, or null for one entered without a name. */
  authors: Array<string | null>;
  link: string | null;
  year: number;
}
