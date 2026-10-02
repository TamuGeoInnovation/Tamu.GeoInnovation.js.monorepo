/**
 * Code Maroon is the university's emergency notification system. It publishes an RSS feed that
 * carries an item only while an alert is active; between alerts the feed is a channel header and
 * nothing else (#1289).
 *
 * No real alert item has ever been observed - the feed was empty every time it was read while this
 * was built. Everything below therefore treats the standard RSS 2.0 fields as the only ones that can
 * be relied on, and keeps whatever else arrives rather than discarding it.
 */

/** A single alert, as published. */
export interface CodeMaroonAlert {
  /** The headline. The monthly test publishes "This is the monthly test of the emergency notification system - No Action Required". */
  title: string;
  /** The body. May repeat the title; the feed is terse. */
  description: string;
  /** Usually a shortened link for the full notice. */
  link?: string;
  /** When it was published, if the feed said and it parsed. */
  published?: Date;
  /** The feed's own identifier, used to tell a new alert from one already seen. */
  guid?: string;
  /**
   * Any element on the item that is not one of the above, kept as text.
   *
   * Deliberate: the real shape is unknown, and a field we did not anticipate is far more useful on
   * screen than silently dropped - particularly during an emergency.
   */
  extra: Record<string, string>;
}

/**
 * What the map knows about Code Maroon at this moment.
 *
 * `unreachable` is a first-class state rather than an error swallowed into "no alerts". A map that
 * shows nothing because the feed failed, while an emergency is under way, is the worst thing this
 * could do - so it is something the interface can say out loud.
 */
export type CodeMaroonStatus = 'active' | 'clear' | 'unreachable' | 'loading';

export interface CodeMaroonState {
  status: CodeMaroonStatus;
  alerts: CodeMaroonAlert[];
  /** When the feed was last read successfully. */
  checkedAt?: Date;
  /** Why the last read failed, for the unreachable state. */
  error?: string;
  /** True when the alerts are a demonstration sample rather than live data. */
  sample: boolean;
}
