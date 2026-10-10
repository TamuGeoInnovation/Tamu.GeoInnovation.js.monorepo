import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { DragDirective } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { BusListComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-bus-list-bottom',
  templateUrl: './bus-list-bottom.component.html',
  styleUrls: ['./bus-list-bottom.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DragDirective, BusListComponent]
})
export class BusListBottomComponent implements OnInit, OnDestroy {
  private readonly ds = inject(DragService);
  private readonly router = inject(Router);

  public identifier: string;

  public ngOnInit(): void {
    this.identifier = this.ds.register(this);
  }

  public ngOnDestroy(): void {
    this.ds.unregister(this.identifier);
  }

  public routeReturn() {
    this.router.navigate(['/map']);
  }
}
