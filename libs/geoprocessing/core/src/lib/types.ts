/**
 * Standard callback function signature interface
 */
export type CallBack<T> = (err: Error, res: T) => void;

/**
 * Maps a flat interface and for every key entry,
 * assigns a DefaultTransformer interface, with the
 * current iterating key's type as a parameter.
 *
 * Interpretation: Interface for a settings tree with definitions on
 * default values, transformation functions, and target keys whose values
 * are injected into the transformation function, if any
 */
export type TransformersMap<U> = {
  [P in keyof U]?: Transformer<U[P], U>;
};

/**
 * Interface for a default transformer object.
 *
 * This is used to set tool default values and a function
 * definition
 *
 * @template U Value type
 */
export interface Transformer<U, O> {
  /**
   * Default value for the key-ed setting.
   *
   * Once values are patched and defaults calculated, this will
   * reflect the latest value if it underwent any transformation.
   */
  value: U;

  /**
   * Exclude the parent key and associated value when constructing query
   * param strings.
   */
  excludeParams?: boolean;

  /**
   * String or array of string parent key values whose associated values are passed into
   * the transformation function.
   */
  target?: keyof O | Array<keyof O>;

  /**
   * Transformation function. If defined, on default value calculation the `target values
   * will be provided as function arguments.
   */
  fn?: (...args) => void;
}

//
// Errors
//
export interface INormalizedGeoservicesJsonError<T> {
  statusCode?: number | string;
  error?: string;
  message?: string;
  response?: T;
}

export type NormalizedGeoservicesTextError = string;

export type NormalizedXMLError = XMLDocument;

export enum ApiResponseFormat {
  /**
   * Responses where the response contains a text status code **name**
   */
  Text = 1,
  /**
   * Responses where the response contains a numeric status code
   */
  Code = 2
}
