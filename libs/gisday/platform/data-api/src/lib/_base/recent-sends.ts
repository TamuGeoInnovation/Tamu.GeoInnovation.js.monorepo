/**
 * The repeat guard of a speaker email that nothing else records (#3065): when each was last sent, by a key such as
 * `<session>:<speaker>`, kept by this API process. The session details email (#3092) and the Ask for slides email (#3113)
 * each keep one, so a repeated request emails no one twice within `minutes`.
 *
 * A repeat that reaches the same process is caught; one that reaches another pod is not. The profile email's guard reads
 * its links table instead, which every pod shares.
 */
export class RecentSends {
  /** When each key was last sent, in milliseconds. */
  private readonly sentAt = new Map<string, number>();

  constructor(private readonly minutes: number) {}

  /**
   * Records `keys` as sent now and answers true, unless any of them was sent in the last `minutes`: then it records
   * nothing and answers false. Nothing is awaited between the check and the record, so two sends racing in this process
   * skip each other's.
   */
  public claim(keys: ReadonlyArray<string>): boolean {
    const now = Date.now();

    if (keys.some((key) => now - (this.sentAt.get(key) ?? -Infinity) <= this.minutes * 60 * 1000)) {
      return false;
    }

    keys.forEach((key) => this.sentAt.set(key, now));

    return true;
  }

  /** Forgets `keys`, for an email that could not be sent: not sent, so not a repeat, and the admin may try again at once. */
  public release(keys: ReadonlyArray<string>): void {
    keys.forEach((key) => this.sentAt.delete(key));
  }

  /** Drops records older than the guard, so it holds only the last few minutes' sends. */
  public forgetOld(): void {
    const since = Date.now() - this.minutes * 60 * 1000;

    for (const [key, at] of this.sentAt) {
      if (at < since) {
        this.sentAt.delete(key);
      }
    }
  }
}
