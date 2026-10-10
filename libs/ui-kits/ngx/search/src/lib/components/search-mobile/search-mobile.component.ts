import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, inject } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SearchService } from '../../services/search.service';
import { SearchComponent } from '../search/search.component';
import { NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-search-mobile',
  templateUrl: './search-mobile.component.html',
  styleUrls: ['../search/search.component.scss', './search-mobile.component.scss'],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, AsyncPipe, TitleCasePipe]
})
export class SearchMobileComponent extends SearchComponent {
  private cdr: ChangeDetectorRef;
  private anltcs: Angulartics2;
  private nss: NotificationService;
  private ss: SearchService;
  private env: EnvironmentService;
  private elRef: ElementRef;

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    const anltcs = inject(Angulartics2);
    const nss = inject(NotificationService);
    const ss = inject(SearchService);
    const env = inject(EnvironmentService);
    const elRef = inject(ElementRef);

    super(cdr, anltcs, nss, ss, env, elRef);

    this.cdr = cdr;
    this.anltcs = anltcs;
    this.nss = nss;
    this.ss = ss;
    this.env = env;
    this.elRef = elRef;
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
