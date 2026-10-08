import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

export interface MapNoticeData {
  title: string;
  message: string;
  details?: string[];
  acknowledgeText?: string;
  /** Identifies the notice for session dismissal. Omit and the notice shows every time. */
  sessionKey?: string;
}

/** Marks a notice dismissed for this browser session. */
export const MAP_NOTICE_SESSION_PREFIX = 'map-notice:';

/**
 * A one-off notice shown when a map opens: a venue change, a closure, a date move - something a
 * visitor has to see and that the map itself cannot show.
 *
 * Looks like the event-passed warning, deliberately, because that is the shape people already
 * recognise as "read this before using the map".
 *
 * Dismissal is **per browser session**, not permanent. These notices are usually about an event a few
 * days away, and someone who dismissed it on Wednesday still needs it on Friday. Permanent dismissal
 * is what `AlertModalComponent`'s `persistKey` is for.
 *
 * Session storage can be unavailable or throw - a private window, blocked site data - so every access
 * is guarded. When it fails the notice simply shows again, which is the safe direction to fail for
 * something a visitor is meant to read.
 */
@Component({
    selector: 'tamu-gisc-map-notice',
    templateUrl: './map-notice.component.html',
    styleUrls: ['./map-notice.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ButtonComponent]
})
export class MapNoticeComponent {
  public title: string;
  public message: string;
  public details: string[];
  public acknowledgeText: string;

  /** Whether this notice has already been dismissed in this session. */
  public static isDismissed(sessionKey: string): boolean {
    try {
      return globalThis.sessionStorage?.getItem(`${MAP_NOTICE_SESSION_PREFIX}${sessionKey}`) === 'true';
    } catch {
      return false;
    }
  }

  public static markDismissed(sessionKey: string): void {
    try {
      globalThis.sessionStorage?.setItem(`${MAP_NOTICE_SESSION_PREFIX}${sessionKey}`, 'true');
    } catch {
      // Nothing to do: the notice will show again next time, which is the safe failure.
    }
  }

  constructor(
    private readonly mr: ModalRefService,
    @Inject(MODAL_DATA) private readonly data: MapNoticeData
  ) {
    this.title = data?.title ?? '';
    this.message = data?.message ?? '';
    this.details = data?.details ?? [];
    this.acknowledgeText = data?.acknowledgeText || 'OK';
  }

  public acknowledge() {
    if (this.data?.sessionKey) {
      MapNoticeComponent.markDismissed(this.data.sessionKey);
    }

    this.mr.close(true);
  }
}
