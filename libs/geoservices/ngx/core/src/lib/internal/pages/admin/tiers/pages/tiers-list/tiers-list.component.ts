import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Tier } from '@tamu-gisc/geoservices/data-api';
import { TiersService } from '@tamu-gisc/geoservices/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseListComponent } from '../../../../../components/base-list/base-list.component';

@Component({
  selector: 'tamu-gisc-tiers-list',
  templateUrl: './tiers-list.component.html',
  styleUrls: ['./tiers-list.component.scss']
})
export class TiersListComponent extends BaseListComponent<Tier> implements OnInit, OnDestroy {
  constructor(
    private readonly ts: TiersService,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(ts, ms, ns);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public navigateToAdd(): void {
    this.rt.navigate(['add'], { relativeTo: this.at });
  }

  public navigateToEdit(tierId: number): void {
    this.rt.navigate(['edit', tierId], { relativeTo: this.at });
  }

  public override promptDeleteModal(): void {
    super.promptDeleteModal('Tier', 'This action cannot be undone.', 'Tiers');
  }

  public isSelected(tierId: number | undefined): Observable<boolean> {
    if (!tierId) return of(false);

    return this.selectedRows$.pipe(map((rows: Array<string | number>) => rows.includes(tierId)));
  }
}
