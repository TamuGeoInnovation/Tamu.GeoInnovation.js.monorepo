import { SetMetadata } from '@nestjs/common';

/**
 * Provides a flexible way to guard routes based on request query parameter existence.
 *
 * @param {string[]} params List of strings representing the query param tokens that should all be
 * included in a request to successfully pass the request.
 * @param {T} exceptionType Any one of NestJS's HttpException classes. If the parameter check is falsy,
 * the guard will throw this error.
 */
export const RequiredQueryParams = <T>(params: string[], exceptionType: T) =>
  SetMetadata('RequiredQueryParams', [params, exceptionType]);
