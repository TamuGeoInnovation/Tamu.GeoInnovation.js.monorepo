import { Component, ChangeDetectorRef, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';

import { SearchComponent } from '../base/base.component';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SearchService, Sources, SearchSource } from '@tamu-gisc/search';

@Component({
  selector: 'search-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss'],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileSearchComponent extends SearchComponent {
  constructor(
    private cdr: ChangeDetectorRef,
    private anltcs: Angulartics2,
    private nss: NotificationService,
    private ms: EsriMapService,
    private ss: SearchService,
    @Optional() @Inject(Sources) private sss: SearchSource[]
  ) {
    super(cdr, anltcs, nss, ms, ss, sss);
  }

  public emitLeftActionEvent(): void {
    if (this.leftActionIcon) {
      if (this.leftActionIcon == 'arrow_back') {
        this.loseFocus();
      }
      this.leftAction.emit();
    }
  }
}
