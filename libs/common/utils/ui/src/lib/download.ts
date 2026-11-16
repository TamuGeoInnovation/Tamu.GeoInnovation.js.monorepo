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
