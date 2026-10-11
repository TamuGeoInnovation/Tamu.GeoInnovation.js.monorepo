import { Type } from '@angular/core';

/**
 * A popup component that is downloaded the first time a popup needs it, instead of with the page.
 *
 * Layer and search source definitions name a popup for every layer. Naming the class pulls it, and
 * everything it imports, into the application's first download whether or not anybody ever opens that
 * popup: an image carousel and a gallery library, in the case of two of them (#1454).
 */
export interface LazyPopupComponent {
  load: () => Promise<Type<unknown>>;
}

/**
 * What a definition's `popupComponent` may hold: the component, or the means to load it.
 */
export type PopupComponentReference = Type<unknown> | LazyPopupComponent;

/**
 * Wraps a dynamic import so a definition can name a popup without loading it:
 *
 * `lazyPopup(() => import('./building.component').then((m) => m.BuildingPopupComponent))`
 */
export function lazyPopup(load: () => Promise<Type<unknown>>): LazyPopupComponent {
  return { load };
}

/**
 * The component a reference stands for, loading it if it has not been loaded yet. The browser caches
 * the import, so a second popup of the same kind resolves at once.
 */
export function loadPopupComponent(reference: PopupComponentReference): Promise<Type<unknown>> {
  return typeof reference === 'function' ? Promise.resolve(reference) : reference.load();
}
