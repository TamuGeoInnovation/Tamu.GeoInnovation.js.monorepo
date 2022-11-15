import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

@Component({
  selector: 'tamu-gisc-bus-list-bottom',
  templateUrl: './bus-list-bottom.component.html',
  styleUrls: ['./bus-list-bottom.component.scss']
})
export class BusListBottomComponent implements OnInit {
  public identifier: string;

  constructor(private readonly ds: DragService, private readonly router: Router) {}

  public ngOnInit(): void {
    this.identifier = this.ds.register(this);
  }

  public routeReturn() {
    this.router.navigate(['/map']);
  }
}
