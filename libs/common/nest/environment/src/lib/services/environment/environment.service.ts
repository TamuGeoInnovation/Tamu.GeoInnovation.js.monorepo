import { Inject, Injectable } from '@nestjs/common';

import { ENVIRONMENT } from '../../tokens/environment.token';

@Injectable()
export class EnvironmentService {
  constructor(@Inject(ENVIRONMENT) private readonly env) {}

  /**
   * Returns value of a token in a provided environment value.
   *
   * Returns `undefined` if value does not exist.
   */
  public value(property: string) {
    if (this.env[property] !== undefined) {
      const value = this.env[property];
      return value;
    } else {
      console.warn(`${property} token not found in app environment.`);

      return undefined;
    }
  }
}
