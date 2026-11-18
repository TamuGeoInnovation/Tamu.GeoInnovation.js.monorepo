import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { TileComponent } from './tile.component';
import { TileIconComponent } from '../tile-icon/tile-icon.component';
import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileLinkDirective } from '../../directives/tile-link/tile-link.directive';
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
