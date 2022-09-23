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
