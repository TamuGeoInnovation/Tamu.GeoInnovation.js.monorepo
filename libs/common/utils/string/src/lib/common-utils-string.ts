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
   * Evaluates and returns an evaluated template string based on provided options.
   */
  public render(): string {
    if (this.template && this.replacement) {
      return this.template.replace(TEMPLATE_EXPRESSION_GLOBAL_PATTERN, () => {
        // Replace captured block with the provided replacement string.
        return this.replacement;
      });
    } else if (this.template && this.lookup) {
      return this.template.replace(TEMPLATE_EXPRESSION_GLOBAL_PATTERN, (match: string) => {
        // Remove template braces before setting value from lookup object. `{a|b}` is the first of its
        // paths with a value, a blank one counting as none, so a fallback can stand in for an empty field.
        const values = match
          .slice(1, -1)
          .split('|')
          .map((path) => getPropertyValue<unknown>(this.lookup, path));
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
