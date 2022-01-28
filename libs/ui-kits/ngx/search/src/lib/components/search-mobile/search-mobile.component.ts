import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SearchService } from '../../services/search.service';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'tamu-gisc-search-mobile',
  templateUrl: './search-mobile.component.html',
  styleUrls: ['../search/search.component.scss', './search-mobile.component.scss'],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchMobileComponent extends SearchComponent {
  constructor(
    private cdr: ChangeDetectorRef,
    private anltcs: Angulartics2,
    private nss: NotificationService,
    private ss: SearchService,
    private env: EnvironmentService
  ) {
    super(cdr, anltcs, nss, ss, env);
  }

  public emitLeftActionEvent(): void {
    if (this.leftActionIcon) {
      if (this.leftActionIcon === 'arrow_back') {
        this.loseFocus();
      }
      this.leftAction.emit();
    }
  }
}
