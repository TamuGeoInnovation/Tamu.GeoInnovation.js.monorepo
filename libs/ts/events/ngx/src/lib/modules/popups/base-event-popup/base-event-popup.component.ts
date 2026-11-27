import { inject } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import { EventSettingsQuery } from '../../../services/settings/event-settings-query';
import { ShareUrlIdentity, eventShareUrl, searchSourceIdentity } from './event-share-url';

/**
 * A popup of the event maps' own, whose copy link reopens the feature on the event map (`eventShareUrl`).
 *
 * A subclass returning an identity from `_getShareUrlIdentity` gets every other part of the link unchanged - the
 * builder selections stamped onto it, and the clearing of any stale feature parameter already in the URL.
 */
export abstract class BaseEventPopupComponent extends BaseDirectionsComponent {
  private readonly _eventSettingsService = inject(EventSettingsQuery);

  protected override _makeShareUrl(): string {
    return eventShareUrl(this._eventSettingsService, this.data, this._getShareUrlIdentity());
  }

  /**
   * A readable name for this feature in a copied link. By default, the one the map's own search sources give it
   * (`searchSourceIdentity`).
   */
  protected _getShareUrlIdentity(): ShareUrlIdentity | null {
    return searchSourceIdentity(this._eventSettingsService, this.data);
  }
}
