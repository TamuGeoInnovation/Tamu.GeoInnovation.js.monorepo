import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

export const env = new InjectionToken<any>('environment');

@Injectable()
export class EnvironmentService {
  private _config: any;

  constructor(@Optional() @Inject(env) private environment: any) {
    if (environment) {
      // Freeze the environment object to ensure immutability
      this._config = Object.freeze(this.environment);

      if (this._config.metadata) {
        // eslint-disable-next-line no-restricted-syntax
        console.info(`Environment module initialized.\n`);
        // eslint-disable-next-line no-restricted-syntax
        console.info(`\n
Build Date: ${this._config.metadata.buildDate}
Git Commit: ${this._config.metadata.gitCommit}
Git Tag: ${this._config.metadata.gitTag}
Container Name: ${this._config.metadata.containerName}
Node Name: ${this._config.metadata.nodeName}\n
          `);
      }
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
  public value(property: string, optional?: boolean): any {
    if (this._config && this._config[property] !== undefined) {
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
