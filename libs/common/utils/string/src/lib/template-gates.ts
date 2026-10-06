/**
 * The conditions that decide whether an element in an Angular template renders.
 *
 * Both of Angular's forms count: the element's own `*ngIf="..."`, and every `@if (...) { ... }` block
 * that encloses it (Angular 17's control flow, which Angular 20's migration converted most templates
 * to, #1447). An `@else` branch is not a gate on its own condition, so a block is only counted while
 * the element sits inside its first branch.
 *
 * For tests that read templates as text, to check an element is gated (#1003, #1251). Comments should
 * be stripped by the caller first; they render nothing.
 *
 * @param template The template source.
 * @param index Where the element's opening tag starts in `template`.
 * @param tag The element's opening tag.
 */
export function templateGates(template: string, index: number, tag: string): string[] {
  const gates: string[] = [];

  const own = tag.match(/\*ngIf="([^"]*)"/)?.[1];

  if (own !== undefined) {
    gates.push(own);
  }

  for (const block of template.slice(0, index).matchAll(/@if\s*\(/g)) {
    const conditionStart = (block.index ?? 0) + block[0].length;
    const conditionEnd = closingIndex(template, conditionStart - 1, '(', ')');
    const bodyStart = template.indexOf('{', conditionEnd);

    if (conditionEnd < 0 || bodyStart < 0 || bodyStart > index) {
      continue;
    }

    const bodyEnd = closingIndex(template, bodyStart, '{', '}');

    if (bodyEnd < 0 || bodyEnd > index) {
      gates.push(template.slice(conditionStart, conditionEnd).trim());
    }
  }

  return gates;
}

/** The index of the bracket closing the one at `open`, counting nesting, or -1 if it never closes. */
function closingIndex(source: string, open: number, opening: string, closing: string): number {
  let depth = 0;

  for (let i = open; i < source.length; i++) {
    if (source[i] === opening) {
      depth++;
    } else if (source[i] === closing) {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}
