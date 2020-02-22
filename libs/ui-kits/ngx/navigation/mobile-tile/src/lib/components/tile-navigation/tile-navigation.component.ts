import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-tile-navigation',
  templateUrl: './tile-navigation.component.html',
  styleUrls: ['./tile-navigation.component.scss']
})
export class TileNavigationComponent implements OnInit {
  @Input()
  public toggle: Observable<unknown>;

  constructor() {}

  public ngOnInit() {
    if (this.toggle !== undefined) {
      this.toggle.subscribe(() => {
        debugger;
      });
    }
  }
}
