export abstract class AbstractCollector {
  /**
   * Collector initialization function that schedules scraping at a provided interval.
   */
  public abstract init(): void;

  // tslint:disable-next-line: no-any
  public abstract scrape(params?: any): AnyPromise;
}

// tslint:disable-next-line: no-any
export type AnyPromise = Promise<void> | Promise<unknown> | Promise<any>;
