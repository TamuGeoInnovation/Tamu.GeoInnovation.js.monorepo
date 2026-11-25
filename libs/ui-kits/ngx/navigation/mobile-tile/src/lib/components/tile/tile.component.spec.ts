import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { TileComponent } from './tile.component';
import { TileIconComponent } from '../tile-icon/tile-icon.component';
import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';
import { TileSubmenuDirective } from '../../directives/tile-submenu/tile-submenu.directive';
import { TileService } from '../../services/tile.service';

/** A tile that links somewhere, as the sites' mobile menus write them: the link is on the tile's title. */
@Component({
  imports: [TileComponent, TileIconComponent, TileTitleComponent, TileLinkDirective],
  template: `
    <tamu-gisc-tile>
      <tamu-gisc-tile-icon><div class="material-icons">widgets</div></tamu-gisc-tile-icon>
      <tamu-gisc-tile-title tamuGiscTileLink location="/sessions">Sessions</tamu-gisc-tile-title>
    </tamu-gisc-tile>
  `
})
class LinkTileHostComponent {}

/** A tile that opens a submenu instead of linking, as GIS Day's About does. */
@Component({
  imports: [TileComponent, TileIconComponent, TileTitleComponent, TileSubmenuDirective],
  template: `
    <tamu-gisc-tile>
      <tamu-gisc-tile-icon><div class="material-icons">info</div></tamu-gisc-tile-icon>
      <tamu-gisc-tile-title>About</tamu-gisc-tile-title>
      <ng-template giscTileSubmenu><p>Submenu</p></ng-template>
    </tamu-gisc-tile>
  `
})
class SubmenuTileHostComponent {}

/** #3198: on a phone, a tap anywhere on a menu tile follows it, not only a tap on its title's words. */
describe('TileComponent, a tile with a link (#3198)', () => {
  function open() {
    TestBed.configureTestingModule({ imports: [LinkTileHostComponent], providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(LinkTileHostComponent);
    const router = TestBed.inject(Router);
    const service = TestBed.inject(TileService);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const toggleMenu = vi.spyOn(service, 'toggleMenu');

    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    return { root, navigate, toggleMenu };
  }

  it('follows the link on a tap on the tile itself, its padding, and closes the menu', () => {
    const { root, navigate, toggleMenu } = open();

    root.querySelector<HTMLElement>('tamu-gisc-tile')?.click();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/sessions'], undefined);
    expect(toggleMenu).toHaveBeenCalledWith(false);
  });

  it('follows the link on a tap on the icon', () => {
    const { root, navigate } = open();

    root.querySelector<HTMLElement>('tamu-gisc-tile-icon .material-icons')?.click();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/sessions'], undefined);
  });

  it('follows the link once, not twice, on a tap on the title', () => {
    const { root, navigate } = open();

    root.querySelector<HTMLElement>('tamu-gisc-tile-title')?.click();

    expect(navigate).toHaveBeenCalledTimes(1);
  });
});

/** #2588: a menu tile is a link or a button for the keyboard and screen readers, not only for a tap. */
describe('TileComponent, by keyboard (#2588)', () => {
  function key(el: HTMLElement, k: string) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  }

  it('makes a tile with a link one focusable link, and follows it on Enter', () => {
    TestBed.configureTestingModule({ imports: [LinkTileHostComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LinkTileHostComponent);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const tile = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tamu-gisc-tile') as HTMLElement;

    expect(tile.getAttribute('tabindex')).toBe('0');
    expect(tile.getAttribute('role')).toBe('link');
    expect(fixture.nativeElement.querySelectorAll('[tabindex]').length).toBe(1);
    // Named by its title alone: the icon's ligature text is hidden from screen readers.
    expect(tile.querySelector('tamu-gisc-tile-icon')?.getAttribute('aria-hidden')).toBe('true');

    key(tile, 'Enter');

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/sessions'], undefined);
  });

  it('makes a tile with a submenu one focusable button, and opens the submenu on Enter or Space', () => {
    TestBed.configureTestingModule({ imports: [SubmenuTileHostComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SubmenuTileHostComponent);
    const toggleSubmenu = vi.spyOn(TestBed.inject(TileService), 'toggleSubmenu');
    fixture.detectChanges();

    const tile = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tamu-gisc-tile') as HTMLElement;

    expect(tile.getAttribute('tabindex')).toBe('0');
    expect(tile.getAttribute('role')).toBe('button');

    key(tile, 'Enter');
    key(tile, ' ');

    expect(toggleSubmenu).toHaveBeenCalledTimes(2);
    expect(toggleSubmenu).toHaveBeenCalledWith(true);
  });
});
