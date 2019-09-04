import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

export const env = new InjectionToken('environment');

@Injectable()
export class EnvironmentService {
  private _config: any;

  constructor(@Optional() @Inject(env) private environment) {
    if (environment) {
      this._config = this.environment;
    } else {
      throw new Error(`Environment module expects an 'env' token value. None provided.`);
    }
  }

  public value(property: string) {
    if (this._config[property]) {
      return this._config[property];
    }
  }
}
