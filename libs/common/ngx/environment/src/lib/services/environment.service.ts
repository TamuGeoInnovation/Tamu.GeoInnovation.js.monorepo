import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

export const env = new InjectionToken<string>('environment');

@Injectable()
export class EnvironmentService {
  private _config;

  constructor(@Optional() @Inject(env) private environment) {
    if (environment) {
      // Freeze the environment object to ensure immutability
      this._config = Object.freeze(this.environment);
    } else {
      throw new Error(`Environment module expects an 'env' token value. None provided.`);
    }
  }

  /**
   * Retrieves a value from the environment configuration by object/property token.
   *
   * @param {string} property Existing key/token in environment configuration.
   * @param {boolean} [optional] Marking a value as optional will not throw an application error. Will return `undefined` if token does not exist.
   */
  public value(property: string, optional?: boolean) {
    if (this._config[property] !== undefined) {
      return this._config[property];
    } else {
      if (optional) {
        console.log(`Environment does not contain a optional '${property}' token. Execution not interrupted.`);
        return undefined;
      } else {
        throw new Error(`Environment does not contain a '${property}' token.`);
      }
    }
  }
}
