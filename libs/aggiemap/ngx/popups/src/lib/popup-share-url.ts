import { InjectionToken } from '@angular/core';

import esri = __esri;

/**
 * The copy link for a feature shown in a markdown popup, or `null` for none (#3486).
 *
 * AggieMap provides nothing, so its markdown popups make the link their base class makes: none, as their features
 * have no parameter of their own to reopen them by. The event maps provide one, because an event map's link has to
 * carry its own path and the builder selections, which only the event maps know about. That is why the markdown
 * popups could be one pair for both applications rather than one copy each.
 *
 * Only the markdown popups read it. Every other popup makes its own link, so providing it changes nothing else.
 */
export const POPUP_SHARE_URL = new InjectionToken<(feature: esri.Graphic) => string | null>('POPUP_SHARE_URL');
