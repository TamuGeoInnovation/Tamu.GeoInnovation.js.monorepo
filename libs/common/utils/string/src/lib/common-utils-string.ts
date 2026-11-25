import { getPropertyValue } from '@tamu-gisc/common/utils/object';

const TEMPLATE_EXPRESSION_PATTERN = /\{.*?\}/;
const TEMPLATE_EXPRESSION_GLOBAL_PATTERN = /\{.*?\}/g;

/**
 * Rendering class able to accept a single string and replace values between and including double curly
 * braces {{ }} with provided value.
 *
 * Also capable of rendering a template string based on a provided object property. A block may list
 * several property paths, `{attributes.name|attributes.zone_ID}`, and renders the first with a value.
 */
export class TemplateRenderer {
  public template: TemplateRendererOptions['template'];
  public lookup: TemplateRendererOptions['lookup'];
  public replacement: TemplateRendererOptions['replacement'];
  public options: TemplateRendererOptions['options'];

  /**
   * Creates an instance of TemplateRenderer.
   *
   * Rendering class able to accept a single string and replace values between and including double curly
   * braces {{ }} with provided value.
   *
   * Also capable of rendering a template string based on a provided object property.
   */
  constructor(props: TemplateRendererOptions) {
    this.template = props.template || undefined;
    this.lookup = props.lookup || undefined;
    this.replacement = props.replacement || undefined;
    this.options = props.options || {};
  }

  /**
   * Evaluates and returns an evaluated template string based on provided options. `undefined` when there is no
   * template, or neither a replacement nor a lookup to fill it from (#3495).
   */
  public render(): string | undefined {
    const replacement = this.replacement;
    const lookup = this.lookup;

    if (this.template && replacement) {
      return this.template.replace(TEMPLATE_EXPRESSION_GLOBAL_PATTERN, () => {
        // Replace captured block with the provided replacement string.
        return replacement;
      });
    } else if (this.template && lookup) {
      return this.template.replace(TEMPLATE_EXPRESSION_GLOBAL_PATTERN, (match: string) => {
        // Remove template braces before setting value from lookup object. `{a|b}` is the first of its
        // paths with a value, a blank one counting as none, so a fallback can stand in for an empty field.
        const values = match
          .slice(1, -1)
          .split('|')
          .map((path) => getPropertyValue<unknown>(lookup, path));
        const resolved =
          values.length === 1
            ? values[0]
            : values.find((value) => value !== undefined && value !== null && `${value}`.trim() !== '');

        if (resolved === undefined || resolved === null) {
          // Keep placeholder when no nullish replacement is provided.
          if (this.options?.nullishReplacement === undefined) {
            return match;
          }

          return this.options.nullishReplacement;
        }

        const resolvedString = `${resolved}`;

        if (this.options?.trim) {
          return resolvedString.trim();
        }

        return resolvedString;
      });
    }
  }
}

export function hasTemplateExpression(template?: string): boolean {
  if (!template) {
    return false;
  }

  return TEMPLATE_EXPRESSION_PATTERN.test(template);
}

/**
 * Evaluates whether an input string is falsy either due to an undefined value or it being of length 0.
 */
export function isFalsy(s: string): boolean {
  if (s === undefined || s.length === 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * Properties describing the TemplateRenderer class.
 */
/**
 * Renders a multi-line template and drops any line whose expressions all resolved to nothing, the static
 * text of that line included.
 *
 * A popup row is written `<strong>Type</strong>: {attributes.notes}`, and a service is entitled to leave a
 * field empty on a layer where it does not apply. Rendering that row anyway prints **Type:** with nothing
 * after it, which reads as a fault in the map rather than an absent value (#2816). Hiding the value alone is
 * not enough: the label is the visible half.
 *
 * A line is dropped only when it HAS expressions and none of them produced anything. A line of static text
 * is kept, because somebody wrote it deliberately.
 *
 * Single-line templates are rendered unchanged, so a popup whose whole description resolves to nothing still
 * renders as it did rather than disappearing. This is about rows.
 */
export function renderTemplateRows(props: TemplateRendererOptions & { separator?: string }): string | undefined {
  const separator = props.separator ?? '\n';
  const template = props.template ?? '';

  if (!template.includes(separator)) {
    return new TemplateRenderer(props).render();
  }

  return template
    .split(separator)
    .filter((line) => {
      if (!TEMPLATE_EXPRESSION_PATTERN.test(line)) {
        return true;
      }

      // A line whose expressions all resolved to nothing renders exactly as its own static skeleton - the
      // line with every expression removed. Comparing the two needs no second copy of the resolution rules,
      // so this cannot drift away from what TemplateRenderer actually does.
      const rendered = new TemplateRenderer({
        ...props,
        template: line,
        options: { ...props.options, nullishReplacement: '' }
      }).render();

      // undefined only with neither a lookup nor a replacement, when nothing was produced (#3495).
      return (rendered ?? '').trim() !== line.replace(TEMPLATE_EXPRESSION_GLOBAL_PATTERN, '').trim();
    })
    .map((line) =>
      new TemplateRenderer({
        ...props,
        template: line,
        options: { ...props.options, nullishReplacement: '' }
      }).render()
    )
    .join(separator);
}

export interface TemplateRendererOptions {
  /**
   * Text template. Anything between and including double matching curly braces will be replaced
   * with either a static value or a value based on object property lookup.
   */
  template?: string;

  /**
   * Object used for property lookup. Matched values will be used for replacement instead of a
   * static provided replacement value.
   */
  lookup?: object;

  /**
   * Replacement value.
   *
   * Only required in when providing an input string.
   *
   * If using inputObject, values will be derived from property value lookup.
   */
  replacement?: string;

  options?: {
    /**
     * String to replace null\undefined values with.
     *
     * This is useful when rendering templates that may contain nullish values.
     *
     * Default behavior is to render the template as is.
     */
    nullishReplacement?: string;

    /**
     * Trim the resulting string.
     *
     * Default is `false`: behavior is to not trim the resulting string.
     */
    trim?: boolean;
  };
}
