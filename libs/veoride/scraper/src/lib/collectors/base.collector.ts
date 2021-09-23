import { URLSearchParams } from 'url';

import got from 'got';

import { AbstractCollector, AnyPromise } from './abstract.collector';

export class BaseCollector<
  S extends BaseCollectorConstructorProperties,
  T extends BaseRequestParams
> extends AbstractCollector {
  public acceptHeader = 'application/vnd.mds+json;version=1.1';
  public params: S;

  constructor(params: S) {
    super();
    this.params = params;
  }

  public resource<TR>(parameters: T): Promise<MDSResponse<TR>> {
    return got
      .get(this.params.url, {
        headers: {
          Accept: this.acceptHeader,
          Authorization: `Bearer ${this.params.token}`
        },
        searchParams: new URLSearchParams(parameters)
      })
      .json();
  }

  public init() {
    console.log('Initializing trip collector....');

    setTimeout(async () => {
      this.scrape();
    }, 3000);

    setInterval(async () => {
      this.scrape();
    }, this.params.interval * 60 * 1000);
  }

  // tslint:disable-next-line: no-any
  public scrape(): AnyPromise {
    throw new Error('Method not implemented.');
  }
}

export interface BaseCollectorConstructorProperties {
  /**
   * Bearer token authorization key to be used in all resource requests.
   */
  token: string;
  url: string;
  persistanceKey: string;

  /**
   * Interval to check for new resource objects in minutes.
   */
  interval: number;
}

// tslint:disable-next-line: no-empty-interface
export interface BaseRequestParams {
  [key: string]: string;
}

export interface MDSResponse<ResourceType> {
  version: string;
  data: ResourceType;
}
