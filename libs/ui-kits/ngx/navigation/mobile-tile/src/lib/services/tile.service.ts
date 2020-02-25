import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TileService {
  public menuActive: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public submenuActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public activeSubMenu: BehaviorSubject<IActiveSubmenu> = new BehaviorSubject(undefined);

  constructor() {}

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
