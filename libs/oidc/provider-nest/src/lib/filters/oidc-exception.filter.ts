import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

export enum ExceptionStatus {
  EXISTS = "",
}

export class OidcException {
  constructor() {

  }
}

export class OidcRoleException extends HttpException {
  constructor() {
    super('');
  }
}

@Catch(OidcRoleException)
export class OidcExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {

  }
}
