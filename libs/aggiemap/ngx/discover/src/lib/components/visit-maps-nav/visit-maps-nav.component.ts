import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

/**
 * One tile in the Visit Maps row.
 *
 * The artwork is data rather than markup because the row is rendered on every Maps page now, and the
 * icon geometry is long enough that six copies of it in six templates would be the thing most likely
 * to drift. `viewBox` is per tile: the older glyphs are traced on `0 0 64 64` and the newer ones on
 * `0 0 24 24`.
 */
export interface VisitMapsTile {
  /** The caption under the icon. */
  label: string;
  /** Where the tile navigates. */
  route: string;
  /**
   * Only when the accessible name should differ from the visible label; the label is used otherwise.
   * Every tile carries an `aria-label` either way - two unit tests assert it, because the icon is
   * decorative and the label alone is what a screen reader would otherwise have.
   */
  ariaLabel?: string;
  /**
   * Development-only tiles are rendered only on a development host, through `TestingService`. The
   * smoke suite asserts the gate from the other side: `DEVELOPMENT_ONLY_ALL_MAPS_TILES` in
   * `test/smoke/aggiemap/development-only.ts` requires the tile to be absent on production.
   */
  isDev?: true;
  icon: { kind: 'path'; viewBox: string; d: string } | { kind: 'image'; src: string };
}

/**
 * The tiles, in order. Exported so the development-only ones can be compared with the smoke suite's list of them
 * (`development-only-gates.spec.ts`, #2788).
 */
export const VISIT_MAPS_TILES: VisitMapsTile[] = [
  {
    label: 'Anniversary',
    route: '/all-maps/150',
    ariaLabel: '150th Anniversary',
    icon: { kind: 'image', src: '/assets/images/logo/150th-wordmark-stacked-maroon.svg' }
  },
  {
    // One tile for both kinds of map since #2895: the page below it lists the transportation maps above the
    // parking ones. The glyph is the maintainer's bus-and-car artwork, traced from the PNG he supplied rather
    // than hand-drawn, so it is his design and not an approximation of it; the reference image is committed in
    // `docs/screenshots/2895-parking-transportation/`. It is a filled path, so it takes `currentColor` like the
    // rest of the row and follows the hover and the dark mode (#2865). Deliberately a placeholder: the artwork
    // is thick-stroked and reads heavily at 52 px, and Transportation are expected to supply a drawn-for-size
    // version, tracked in #2897.
    label: 'Parking & Transportation',
    route: '/all-maps/parking',
    icon: { kind: 'path', viewBox: '0 0 64 64', d: 'M8.92 8.7C7.54 8.96 6.19 9.66 5.16 10.68C4.37 11.46 3.34 13.19 3.34 13.7C3.34 13.87 6.37 13.91 21.16 13.91C38.96 13.91 38.96 13.91 38.85 13.54C38.08 11.08 35.62 9.04 32.96 8.64C31.31 8.41 10.27 8.46 8.92 8.7Z M3.02 23.01L3.02 28.44L12.42 28.44L21.83 28.44L21.51 29.67C20.82 32.43 22.1 32.11 11.94 32.11L3 32.11L3.05 38.95C3.1 45.8 3.1 45.8 3.57 46.58C3.91 47.12 4.31 47.51 4.85 47.79C5.65 48.24 5.65 48.24 10.65 48.24L15.63 48.24L15.63 50.03C15.63 51.02 15.7 51.93 15.76 52.04C15.87 52.19 16.51 52.23 18.44 52.2L20.98 52.15L21.08 47.68C21.12 45.13 21.24 42.99 21.33 42.7C21.88 41.1 23.01 39.62 24.46 38.58C24.88 38.28 25.01 37.88 26.24 32.96C27.9 26.41 28.31 25.52 30.48 24.13C32.1 23.09 32.67 23.01 38.07 23.01C42.33 23.01 42.92 22.98 43 22.75C43.05 22.61 43.1 21.4 43.1 20.04L43.1 17.58L23.06 17.58L3.02 17.58L3.02 23.01Z M11.42 38.64C13.14 39.43 13.46 41.85 12.01 43.19C10.36 44.73 7.49 43.43 7.49 41.15C7.49 39.09 9.53 37.78 11.42 38.64Z M32.96 26.99C32.13 27.35 31.19 28.42 30.98 29.19C30.12 32.46 28.95 37.38 29.01 37.46C29.13 37.57 56.59 37.57 56.7 37.45C56.82 37.35 54.71 28.95 54.47 28.5C54.18 27.98 53.27 27.19 52.65 26.94C51.67 26.52 33.87 26.57 32.96 26.99Z M26.89 41.52C25.92 41.95 25.12 42.94 24.89 43.94C24.78 44.54 24.73 46.55 24.77 50.16L24.81 55.51L42.91 55.55L61 55.59L60.95 49.73C60.9 43.21 60.9 43.23 59.75 42.14C58.73 41.17 59.56 41.21 42.83 41.21C28.37 41.21 27.5 41.23 26.89 41.52Z M33.6 46.1C35.27 47.2 34.97 50.11 33.09 50.89C30.58 51.95 28.25 49.18 29.68 46.85C30.44 45.62 32.3 45.25 33.6 46.1Z M55.03 45.96C56.54 46.68 56.96 48.82 55.83 50.11C53.53 52.73 49.53 49.71 51.47 46.8C52.17 45.75 53.78 45.35 55.03 45.96Z' }
  },
  {
    label: 'Athletics Events',
    route: '/all-maps/athletics-events',
    icon: { kind: 'path', viewBox: '0 0 64 64', d: 'M45.25 0H18.76C9.44 0 1.86 7.58 1.86 16.9v24a4.66 4.66 0 0 0 4.65 4.65h11.54l1.54 17.08c.05.58.43 1.07.97 1.27.54.2 1.15.07 1.57-.33l4.32-4.18 4.53 4.21c.58.53 1.46.53 2.04 0l4.53-4.21 4.32 4.18c.29.28.66.42 1.04.42.18 0 .35-.03.52-.09.54-.2.92-.7.97-1.27l1.54-17.08h11.54a4.66 4.66 0 0 0 4.65-4.65v-24C62.14 7.58 54.56 0 45.25 0Zm-1.74 31.51H20.5V19.54h23.01v11.97Zm3.25 3c.83 0 1.51.68 1.51 1.51v.28c0 .83-.68 1.51-1.51 1.51H17.24c-.83 0-1.51-.68-1.51-1.51v-.28c0-.83.68-1.51 1.51-1.51h29.52Zm-9.27 20.64-3.34-3.24 3.82-3.71 3.65 3.53-4.13 3.41Zm-10.99 0-4.13-3.41 3.65-3.53 3.82 3.71-3.34 3.24Zm1.67-9.03 3.82-3.71 3.82 3.71-3.82 3.71-3.82-3.71Zm13.13-5.31-3.32 3.22-3.32-3.22h6.65Zm-11.96 0-3.32 3.22-3.32-3.22h6.65Zm10.79 5.31 3.01-2.92-.49 5.37-2.53-2.45Zm-16.27 0-2.53 2.45-.49-5.37 3.01 2.92Zm-1.92 9.15 2.4 1.98-2.04 1.98-.36-3.95ZM32 60.44l-3.39-3.15L32 54l3.39 3.29L32 60.44Zm9.7-1.22-2.04-1.98 2.4-1.98-.36 3.95Zm17.44-18.33c0 .91-.74 1.65-1.65 1.65H46.22l.16-1.74h.38c2.49 0 4.51-2.02 4.51-4.51v-.28c0-2.49-2.02-4.51-4.51-4.51h-.25V18.03c0-.83-.67-1.5-1.5-1.5H19c-.83 0-1.5.67-1.5 1.5V31.5h-.25c-2.49 0-4.51 2.02-4.51 4.51v.28c0 2.49 2.02 4.51 4.51 4.51h.38l.16 1.74H6.51c-.91 0-1.65-.74-1.65-1.65v-24C4.86 9.23 11.09 3 18.75 3h26.49c7.66 0 13.89 6.23 13.89 13.89v24Z' }
  },
  {
    label: 'Campus Events',
    route: '/all-maps/campus-events',
    icon: { kind: 'path', viewBox: '0 0 64 64', d: 'M58.44 18.46 32.87.33c-.52-.37-1.21-.37-1.73 0L5.56 18.46c-.4.28-.63.74-.63 1.22v8.91c0 .83.67 1.5 1.5 1.5h.89v23.5h-.89c-.83 0-1.5.67-1.5 1.5v7.39c0 .83.67 1.5 1.5 1.5h51.14c.83 0 1.5-.67 1.5-1.5v-7.39c0-.83-.67-1.5-1.5-1.5h-.89v-23.5h.89c.83 0 1.5-.67 1.5-1.5v-8.91c0-.49-.24-.94-.63-1.22Zm-2.37 8.63H7.93V22.7h48.14v4.39ZM33.5 53.59v-23.5h8.59v23.5H33.5Zm-11.59 0v-23.5h8.59v23.5h-8.59ZM32 3.39l22.99 16.3H9.01L32 3.39Zm-21.68 26.7h8.59v23.5h-8.59v-23.5Zm45.75 30.89H7.93v-4.39h48.14v4.39Zm-2.39-7.39h-8.59v-23.5h8.59v23.5ZM32 9.37c-2.31 0-4.19 1.88-4.19 4.19s1.88 4.19 4.19 4.19 4.19-1.88 4.19-4.19S34.31 9.37 32 9.37Zm0 5.37c-.65 0-1.19-.53-1.19-1.19s.53-1.19 1.19-1.19 1.19.53 1.19 1.19-.53 1.19-1.19 1.19Z' }
  },
  {
    label: 'Operations',
    route: '/all-maps/operations',
    icon: { kind: 'path', viewBox: '0 0 64 64', d: 'm62.32 51.84-16.4-16.4c.52-.59.51-1.48-.05-2.04s-1.54-.59-2.12 0l-.1.1-2.12-1.51 4.41-4.36a13.96 13.96 0 0 0 13.87-3.43c3.68-3.65 5.07-9.75 3.38-14.85a1.5 1.5 0 0 0-1.08-.99c-.5-.12-1.04.03-1.41.39l-6.97 6.91-4.73-.19-.19-4.77 6.96-6.91c.35-.35.51-.86.42-1.35-.09-.49-.43-.9-.89-1.1C50.19-.84 44.25.36 40.17 4.41c-3.62 3.59-4.9 8.98-3.4 13.99l-6.24 6.17-13.54-13.53-4.94-6.76a1.9 1.9 0 0 0-.38-.37L6.26.34c-.6-.39-1.38-.31-1.89.19L.53 4.37c-.51.5-.59 1.29-.19 1.89l3.59 5.43c.1.15.22.28.37.38l6.76 4.95 13.5 13.5-12.95 12.81c-3.21-.36-6.31.66-8.46 2.78a10.24 10.24 0 0 0-3.04 7.27c-.01 2.75 1.05 5.34 2.99 7.29a10.24 10.24 0 0 0 7.27 3.04h.04c2.73 0 5.31-1.06 7.25-2.99 2.14-2.12 3.23-5.1 3.01-8.09l11.29-11.17 1.55 2.18-.1.1a1.49 1.49 0 0 0 0 2.12c.29.29.68.44 1.06.44.35 0 .7-.14.98-.39l16.4 16.4c1.02 1.03 2.39 1.59 3.84 1.59s2.81-.56 3.84-1.59l2.81-2.81c1.03-1.02 1.59-2.39 1.59-3.84s-.56-2.81-1.59-3.84ZM15.87 14.15l17.74 17.73-1.72 1.72-17.74-17.73 1.72-1.72Zm17.07 22.64 1.92-1.92 2.29-2.29 4.34 3.07-5.85 5.85-3.07-4.34.37-.37Zm6.62-16.9c.42-.42.56-1.04.35-1.59-1.55-4.15-.62-8.76 2.39-11.74 2.62-2.59 6.2-3.71 9.58-3.11l-5.64 5.6c-.3.3-.46.7-.44 1.12l.27 6.81c.03.78.66 1.41 1.44 1.44l6.76.27c.41.02.82-.14 1.12-.43l5.47-5.43c.31 3.4-.85 6.94-3.17 9.24a10.958 10.958 0 0 1-11.62 2.44c-.55-.21-1.17-.08-1.59.33l-5.44 5.38-1.18-.84c-.6-.42-1.41-.36-1.93.16l-.2.2-3.06-3.06 6.89-6.81ZM3.51 5.62l2.11-2.11 4.19 2.77 4.09 5.6-2.03 2.03-5.6-4.09L3.5 5.63Zm14.52 45.39c-.34.34-.5.82-.43 1.29.35 2.31-.42 4.66-2.06 6.29a7.24 7.24 0 0 1-5.14 2.12h-.03c-1.95 0-3.78-.77-5.15-2.16a7.292 7.292 0 0 1-2.12-5.17c0-1.95.78-3.78 2.16-5.15 1.29-1.28 3.12-1.98 5.08-1.98.5 0 1.01.04 1.52.14.49.09.98-.07 1.32-.41l13.49-13.35 3.09 3.09-.2.2a1.49 1.49 0 0 0-.16 1.93l.8 1.12L18.04 51Zm42.17 6.38-2.81 2.81c-.92.92-2.51.92-3.43 0L37.57 43.81l6.24-6.24L60.2 53.96c.46.46.71 1.07.71 1.72s-.25 1.26-.71 1.72Zm-49.74-8.27h-.02c-1.16 0-2.24.45-3.06 1.26a4.33 4.33 0 0 0-1.29 3.07c0 1.16.44 2.26 1.26 3.08a4.33 4.33 0 0 0 3.07 1.29h.02c1.16 0 2.24-.45 3.06-1.26a4.355 4.355 0 0 0-3.05-7.44Zm.93 5.31c-.25.25-.59.39-.95.39a1.347 1.347 0 0 1-1.35-1.36c0-.36.14-.7.4-.95.25-.25.59-.39.95-.39s.7.14.96.4c.52.53.52 1.39 0 1.91Z' }
  },
  {
    label: 'Campus Maps',
    route: '/all-maps/campus',
    icon: { kind: 'path', viewBox: '0 0 24 24', d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z' }
  },
  {
    label: 'Code Maroon',
    route: '/code-maroon',
    isDev: true,
    icon: { kind: 'path', viewBox: '0 0 24 24', d: 'M12 2.2c.62 0 1.2.33 1.51.87l9.3 16.1c.31.54.31 1.2 0 1.74-.31.54-.89.87-1.51.87H2.7c-.62 0-1.2-.33-1.51-.87a1.74 1.74 0 0 1 0-1.74l9.3-16.1c.31-.54.89-.87 1.51-.87Zm0 2.93L3.56 19.78h16.88L12 5.13Zm0 4.12c.6 0 1.08.49 1.08 1.08v4.3a1.08 1.08 0 0 1-2.16 0v-4.3c0-.6.49-1.08 1.08-1.08Zm0 8.2a1.26 1.26 0 1 1 0-2.52 1.26 1.26 0 0 1 0 2.52Z' }
  }
];

/**
 * The Visit Maps row: the tiles linking to each map-type directory page.
 *
 * It was markup inside the All Maps page until #912, which asked for it on every map-type page so a
 * visitor can move between categories without going back to All Maps first. It is rendered by
 * `MapsPageHeaderComponent`, and directly by All Maps, which projects the featured Main Campus
 * Parking button ahead of the row.
 *
 * The featured button is deliberately *not* a tile: it is a different kind of thing, and when it sat
 * in the row it took a whole line to itself at phone widths and pushed the tiles onto further rows.
 */
@Component({
  selector: 'tamu-gisc-visit-maps-nav',
  templateUrl: './visit-maps-nav.component.html',
  styleUrls: ['./visit-maps-nav.component.scss'],
  imports: [RouterLink, AsyncPipe]
})
export class VisitMapsNavComponent {
  private readonly dev = inject(TestingService);

  /** True on a development host, which is what shows the development-only tiles. */
  public readonly isDev: Observable<boolean> = this.dev.get('isTesting');

  public readonly tiles = VISIT_MAPS_TILES;
}
