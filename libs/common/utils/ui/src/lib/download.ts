import * as Papa from 'papaparse';

/**
 * Saves `contents` as a file named `fileName`, through a link the page clicks for itself. Shared by every page that
 * hands the browser a file it built: the class attendance and RSVP CSVs, and the season copy's JSON (#2878).
 */
export function downloadFile(contents: BlobPart, fileName: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** A name that is safe as part of a file name: lower case, with anything but letters and digits as single hyphens. */
export function fileNamePart(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Rows as CSV text, `columns` first as its header line, for a file `downloadFile` saves. A row is either an array, in
 * `columns`' order, or an object keyed by them. Lines end `\r\n`, with none after the last; a cell is quoted where it
 * holds a comma, a quote or a line break, or starts or ends with a space.
 *
 * **A cell that starts like a formula is written as text** (#3332): `=`, `+`, `-`, `@`, a tab or a carriage return gets
 * a `'` in front, so a name someone typed as `=HYPERLINK(...)` is not run when the file is opened in Excel. Numbers are
 * left alone, so a negative count stays a number. Every CSV the GIS Day sites and API write goes through this.
 */
export function toCsv(columns: Array<string>, rows: Array<Array<unknown> | Record<string, unknown>>): string {
  return Papa.unparse({ fields: columns, data: rows }, { escapeFormulae: true });
}
