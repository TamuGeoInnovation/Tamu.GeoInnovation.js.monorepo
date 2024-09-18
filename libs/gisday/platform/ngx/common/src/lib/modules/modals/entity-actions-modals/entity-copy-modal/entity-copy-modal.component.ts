import { Component, Inject, OnInit } from '@angular/core';
import { map, merge, Observable, shareReplay, Subject, take, withLatestFrom } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-entity-copy-modal',
  templateUrl: './entity-copy-modal.component.html',
  styleUrls: ['./entity-copy-modal.component.scss']
})
export class EntityCopyModalComponent implements OnInit {
  public season$: Observable<Partial<Season>>;
  public seasons$ = this.ss.seasons$;

  private _selectedSeason$: Subject<string> = new Subject();

  public get entityType(): string {
    // If entityType is not defined, return 'entity'
    if (this.data.entityType === undefined) return 'entity';

    return this.data.identities.length > 1 ? this.data.entityType + 's' : this.data.entityType;
  }

  constructor(
    @Inject(MODAL_DATA) public readonly data: EntityCopyModalData,
    private readonly modalRef: ModalRefService,
    private readonly ss: SeasonService
  ) {}

  public ngOnInit(): void {
    this.season$ = merge(
      this._selectedSeason$.pipe(
        withLatestFrom(this.seasons$),
        map(([seasonGuid, seasons]) => {
          return seasons.find((s) => s.guid === seasonGuid);
        })
      ),
      this.ss.activeSeason$
    ).pipe(shareReplay(1));
  }

  public setSeason(seasonGuid: string) {
    this._selectedSeason$.next(seasonGuid);
  }

  public confirmCopyEntities() {
    this.season$.pipe(take(1)).subscribe((season) => {
      this.modalRef.close({
        copy: true,
        season: season,
        identities: this.data.identities
      });
    });
  }

  public cancelCopyEntities() {
    this.modalRef.close(false);
  }
}

interface EntityCopyModalData {
  /**
   * Array of identities to be copied. This is only used for displaying the count in the modal.
   */
  identities: Array<unknown>;

  /**
   * The type of entity being copied. Displayed in the modal header.
   */
  entityType: string;

  /**
   * Optional notice to be displayed in the modal body.
   */
  notice?: string;
}
