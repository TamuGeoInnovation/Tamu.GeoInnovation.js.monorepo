/**
 * Why a page is not one the app rendered, or `null` when it is (#1936).
 *
 * A shot is a picture of the app, so it counts only when the server answered 2xx **and** the app's root element is
 * there with content. On 18 October three Move-In pages came back as IIS's "404 - File or directory not found" during
 * a blip, were photographed, and the run said 0 failed; the comparison then showed them as 83% changes rather than as
 * pages that were missing.
 *
 * @param {{ status: number | null, rootContent: number | null }} page `status` is the HTTP status of the page's own
 *   answer (`null` if there was none); `rootContent` is how many children the app's root holds (`null` if it is absent).
 */
export function whyNotRendered({ status, rootContent }) {
  if (status === null || status === undefined) {
    return 'the page gave no answer';
  }

  if (status < 200 || status > 299) {
    return `the server answered ${status}`;
  }

  if (!rootContent) {
    return 'the app did not render: its root element is missing or empty';
  }

  return null;
}
