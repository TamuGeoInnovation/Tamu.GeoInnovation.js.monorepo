import { getPropertyValue } from '@tamu-gisc/common/utils/object';

/**
 * Rendering class able to accept a single string and replace values between and including double curly
 * braces {{ }} with provided value.
 *
 * Also capable of rendering a template string based on a provided object property.
 */
export class TemplateRenderer {
  public template: TemplateRendererOptions['template'];
  public lookup: TemplateRendererOptions['lookup'];
  public replacement: TemplateRendererOptions['replacement'];

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
  }

  /**
   * Evaluates and returns an evaluated template string based on provided options.
   */
  public render(): string {
    if (this.template && this.replacement) {
      return this.template.replace(/\{.*?\}/g, () => {
        // Replace captured block with the provided replacement string.
        return this.replacement;
      });
    } else if (this.template && this.lookup) {
      return this.template.replace(/\{.*?\}/g, (match: string) => {
        // Remove template braces before setting value from lookup object.
        return getPropertyValue<string>(this.lookup, match.replace('{', '').replace('}', ''));
      });
    }
  }
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
}
