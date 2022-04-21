import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class QueryParamGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // tslint:disable-next-line: no-any
    const decoratorArgs = this.reflector.get<[string[], typeof Error]>('RequiredQueryParams', context.getHandler());

    // If there are no params to check, cannot definitively validate request,
    // and should allow a request to proceed.
    if (decoratorArgs === undefined) {
      return true;
    }

    const [requiredParameters, exception] = decoratorArgs;

    const request = context.switchToHttp().getRequest();

    // Pluck parameter tokens from query object
    const requestQueryParamTokens = Object.entries(request.query).map(([key]) => {
      return key;
    });

    // Test if all provided param tokens exist in the request query param tokens array.
    const requestHasAllRequiredParams = requiredParameters.every((rp) => {
      return requestQueryParamTokens.includes(rp);
    });

    if (requestHasAllRequiredParams === false) {
      throw new exception();
    }

    return true;
  }
}
