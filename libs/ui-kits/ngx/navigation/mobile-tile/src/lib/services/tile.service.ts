import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TileService {
  /**
   * Tile navigation root-element active state.
   */
  public menuActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Tile navigation submenu active state.
   */
  public submenuActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Represents the active submenu. Holds a template reference and submenu title.
   *
   * Consumed by other components to render the sub-menu.
   */
  public activeSubMenu: BehaviorSubject<IActiveSubmenu> = new BehaviorSubject(undefined);

  /**
   * Toggle the tile navigation state. If a state value is provided, it will
   * be used instead of flipping the current state value.
   */
  public toggleMenu(state?: boolean) {
    this.menuActive.next(state !== undefined ? state : !this.menuActive.getValue());
  }

  /**
   * Toggle the sub-menu state. If a state value is provided, it will
   * be used instead of flipping the current state value.
   */
  public toggleSubmenu(state?: boolean) {
    this.submenuActive.next(state !== undefined ? state : !this.submenuActive.getValue());
  }

  public updateSubmenu(submenu: IActiveSubmenu) {
    this.activeSubMenu.next(submenu);
  }
}

interface IActiveSubmenu {
  template: TemplateRef<unknown>;
  title: string;
}
