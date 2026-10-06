import { templateGates } from './template-gates';

function gatesOf(template: string, marker: string): string[] {
  const index = template.indexOf(marker);
  const tag = template.slice(index, template.indexOf('>', index) + 1);

  return templateGates(template, index, tag);
}

describe('templateGates', () => {
  it("reads the element's own *ngIf", () => {
    expect(gatesOf('<div *ngIf="isDev | async" id="x">Go</div>', '<div')).toEqual(['isDev | async']);
  });

  it('reads an enclosing @if block, with a pipe and nested parentheses in its condition', () => {
    const template = '@if ((isDev | async) === true) {\n  <div id="x">Go</div>\n}';

    expect(gatesOf(template, '<div')).toEqual(['(isDev | async) === true']);
  });

  it('reads every enclosing block, outermost first', () => {
    const template = '@if (a) { <p></p> @if (b) { <div id="x"></div> } }';

    expect(gatesOf(template, '<div')).toEqual(['a', 'b']);
  });

  it('ignores a block that has closed before the element, interpolation included', () => {
    const template = '@if (a) { <p>{{ name }}</p> }\n<div id="x"></div>';

    expect(gatesOf(template, '<div')).toEqual([]);
  });

  it("does not count a block's condition for its @else branch", () => {
    const template = '@if (a) { <p></p> } @else { <div id="x"></div> }';

    expect(gatesOf(template, '<div')).toEqual([]);
  });
});
