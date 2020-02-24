import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss']
})
export class TileNavigationComponent implements OnInit {
  @Input()
  public toggle: Observable<boolean>;

  public visible = true;

  public submenuVisible = false;

  @HostBinding('style.display')
  public get _visible() {
    return this.visible ? '' : 'none';
  }

  constructor() {}

  public ngOnInit() {
    if (this.toggle !== undefined) {
      this.toggle.subscribe((res) => {
        this.switchState();
      });
    } else {
      console.warn(`No toggle observable for tile navigation provided.`);
    }
  }

  public switchState() {
    this.visible = !this.visible;
  }

  public switchSubMenuState() {
    this.submenuVisible = !this.submenuVisible;
  }
}
