import { Angulartics2 } from 'angulartics2';

/**
 * Sends one analytics event, its custom fields stamped as the reports expect (#3488): `gstCustom` is `guid` (a new
 * random id for the event), then `date` (the time it was sent, as `Date.now()`), then the event's own fields in the
 * order given.
 *
 *   trackEvent(this.analytics, 'sidebar_select', 'ui_interaction', { name: tabTitle });
 *
 * About twenty places built that object by hand; the reports built on them read `guid`, `date` and each custom key
 * exactly as they are, so the shape is kept field for field.
 *
 * @param analytics The page's Angulartics2, as injected.
 * @param action The event's action, such as `routing` or `search`.
 * @param category The event's category, such as `ui_interaction`.
 * @param custom The event's own fields, after `guid` and `date`.
 */
export function trackEvent(
  analytics: Pick<Angulartics2, 'eventTrack'>,
  action: string,
  category: string,
  custom: Record<string, unknown> = {}
): void {
  analytics.eventTrack.next({ action, properties: { category, gstCustom: stampedEvent(custom) } });
}

/** An event's `gstCustom`: `guid`, then `date`, then its own fields (#3488). */
export function stampedEvent(
  custom: Record<string, unknown> = {}
): { guid: string; date: number } & Record<string, unknown> {
  return { guid: crypto.randomUUID(), date: Date.now(), ...custom };
}
