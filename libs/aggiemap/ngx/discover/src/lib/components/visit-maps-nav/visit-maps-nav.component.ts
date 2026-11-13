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
    // parking ones. The glyph is Aggie UX's own `aux_car-bus`, from the Transportation family of the university's
    // icon library (2.1.2), which the testing team pointed out already existed - so the tile carries the brand's
    // artwork rather than a trace of the maintainer's PNG, drawn at the weight the rest of the icon set uses. That
    // settles #2897, which had asked Transportation for a version drawn for 52 px. It arrives on the same
    // `0 0 64 64` grid as the older glyphs and as one filled path, so it takes `currentColor` and follows the hover
    // and dark mode like the rest of the row (#2910).
    label: 'Parking & Transportation',
    route: '/all-maps/parking-transportation',
    icon: { kind: 'path', viewBox: '0 0 64 64', d: 'M13.07 28.15a2.311 2.311 0 1 1-4.622-.002 2.311 2.311 0 0 1 4.622.002Zm10.77.4h-7.41c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h7.41c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Zm0-3.8h-7.41c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h7.41c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Zm.59-19.68h-8.6c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h8.6c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Zm39.45 36.52v.28c0 2.02-1.65 3.67-3.67 3.67h-.74c.46 1.16.81 2.31.96 3.55.19 1.6.03 5.93 0 6.41 0 2.34-1.74 4.29-3.89 4.29h-.43v.92c0 1.8-1.47 3.27-3.27 3.27h-3.92c-1.8 0-3.27-1.47-3.27-3.27v-.92H35.06v.92c0 1.8-1.47 3.27-3.27 3.27h-3.92c-1.8 0-3.27-1.47-3.27-3.27v-.92h-.43c-2.14 0-3.89-1.95-3.89-4.34-.02-.43-.18-4.76 0-6.36.14-1.25.5-2.4.96-3.55h-.74c-2.02 0-3.67-1.65-3.67-3.67v-.28c0-2.02 1.65-3.67 3.67-3.67h1.31c.91 0 1.74.35 2.38.9.17-.44.33-.91.48-1.38 0-.1-.03-.19-.03-.29v-1.58h-9.05v1.58c0 1.84-1.49 3.33-3.33 3.33H9.23c-1.84 0-3.33-1.49-3.33-3.33v-1.66a3.622 3.622 0 0 1-2.86-3.53v-9.58H1.6c-.83 0-1.5-.67-1.5-1.5v-8.94c0-.83.67-1.5 1.5-1.5h1.44V6.91c0-1.93 1.36-3.71 3.47-4.51C10.56.85 15.26.03 20.13.03s9.57.82 13.6 2.36c2.11.81 3.47 2.58 3.47 4.51v3.53h1.44c.83 0 1.5.67 1.5 1.5v8.94c0 .83-.67 1.5-1.5 1.5H37.2v6.73h9.69c4.04 0 7.59 2.93 8.82 7.3.24.86.52 1.65.81 2.41.64-.55 1.47-.9 2.38-.9h1.31c2.02 0 3.67 1.65 3.67 3.67Zm-11.52-5.6c-2.64.25-5.47.43-8.42.51.12.22.2.47.2.74 0 .83-.67 1.5-1.5 1.5h-4.56c-.83 0-1.5-.67-1.5-1.5 0-.27.08-.52.2-.74-2.94-.08-5.78-.25-8.42-.51-.18.39-.34.8-.47 1.24-.44 1.56-.96 2.93-1.49 4.17 4.19.78 8.97 1.19 13.96 1.19s9.77-.41 13.96-1.19c-.53-1.24-1.05-2.6-1.49-4.17-.12-.44-.29-.85-.47-1.24Zm-18.53-3.88c-1.15 0-2.24.4-3.18 1.07 6.14.46 13.28.46 19.43 0-.95-.67-2.03-1.07-3.18-1.07H33.84Zm.37-19.66H21.63v7.92H34.2v-7.92Zm-28.15-3H34.2V6.91c0-.68-.61-1.35-1.55-1.71-3.69-1.42-8.02-2.16-12.52-2.16s-8.84.75-12.52 2.16c-.94.36-1.55 1.03-1.55 1.71v2.54Zm0 10.92h12.57v-7.92H6.06v7.92Zm6.55 15.2H8.91v1.58c0 .18.15.33.33.33h3.03c.18 0 .33-.15.33-.33v-1.58Zm14.36-3a9.71 9.71 0 0 1 2.36-2.13 2.302 2.302 0 0 1-2.13-2.29 2.311 2.311 0 0 1 4.62 0c0 .5-.16.96-.44 1.34.79-.25 1.62-.38 2.47-.38h.37v-5.74H6.06v8.59c0 .34.27.61.61.61h20.3Zm-4.47 9.02c0-.37-.3-.67-.67-.67h-1.31c-.37 0-.67.3-.67.67v.28c0 .37.3.67.67.67h1.97v-.94Zm9.58 18.2h-4.46v.92c0 .15.12.27.27.27h3.92c.15 0 .27-.12.27-.27v-.92Zm21.05 0h-4.46v.92c0 .15.12.27.27.27h3.92c.15 0 .27-.12.27-.27v-.92Zm4.33-10.36c-.19-1.68-.93-3.26-1.85-5.23-4.55.9-9.78 1.38-15.23 1.38s-10.69-.48-15.23-1.38c-.93 1.97-1.66 3.55-1.85 5.23-.13 1.16-.04 4.69 0 5.96 0 .85.47 1.4.89 1.4h32.38c.42 0 .89-.55.89-1.34.05-1.32.14-4.85 0-6.01Zm3.43-7.84c0-.37-.3-.67-.67-.67H58.9c-.37 0-.67.3-.67.67v.94h1.97c.37 0 .67-.3.67-.67v-.28Zm-18.23 8.82h-4.56c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h4.56c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Zm12.19-1.63v3.01c0 2.23-1.81 4.04-4.04 4.04h-2.12c-1.69 0-3.07-1.38-3.07-3.07v-.22c0-2.9 2.36-5.26 5.26-5.26h2.46c.83 0 1.5.67 1.5 1.5Zm-3 1.5h-.96c-1.25 0-2.26 1.02-2.26 2.26v.22l.07.07h2.12c.57 0 1.04-.47 1.04-1.04v-1.51Zm-16.72 2.26v.22c0 1.69-1.38 3.07-3.07 3.07h-2.12c-2.23 0-4.04-1.81-4.04-4.04v-3.01c0-.83.67-1.5 1.5-1.5h2.46c2.9 0 5.26 2.36 5.26 5.26Zm-3 0c0-1.25-1.02-2.26-2.26-2.26h-.96v1.51c0 .57.47 1.04 1.04 1.04h2.12s.07-.03.07-.07v-.22Z' }
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
