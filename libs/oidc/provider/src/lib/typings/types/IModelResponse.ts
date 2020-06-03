/**
 * Properties describing the basic API server response
 *
 * @interface IModelResponse
 */
export interface IModelResponse {
  /**
   * Value indicating if the call was successful or not
   *
   * @type {string}
   * @memberof IModelResponse
   */
  success: boolean;

  /**
   * Optional value which can return a message from the server to the client
   *
   * @type {string}
   * @memberof IModelResponse
   */
  message?: string;

  /**
   * Optional array containing data returned from the server to client
   *
   * @type {object[]},
   * @memberof IModelResponse
   */
  data?: object[] | object;
}
