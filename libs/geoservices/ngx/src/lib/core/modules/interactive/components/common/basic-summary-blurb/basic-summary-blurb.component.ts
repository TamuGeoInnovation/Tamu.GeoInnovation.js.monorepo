import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject, map, pipe, startWith } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

@Component({
  selector: 'tamu-gisc-basic-summary-blurb',
  templateUrl: './basic-summary-blurb.component.html',
  styleUrls: ['./basic-summary-blurb.component.scss']
})
export class BasicSummaryBlurbComponent implements OnInit {
  @Input()
  public keyFragment: string;

  @Output()
  public navigateFull: EventEmitter<void> = new EventEmitter();

  public showBlurb: Observable<boolean>;

  private _trigger: Subject<void> = new Subject();
  private _primaryKey = 'geoservices';
  private _subKey: string;

  constructor(private readonly ls: LocalStoreService) {}

  public ngOnInit(): void {
    this.showBlurb = this._trigger.pipe(startWith(false), this.getSummaryNoticeSetting());
    this._subKey = `summary_notice_dismissed__${this.keyFragment}`;
  }

  public emitNavigationRequest() {
    this.navigateFull.emit();
  }

  public dismiss() {
    this.ls.setStorageObjectKeyValue({
      primaryKey: this._primaryKey,
      subKey: this._subKey,
      value: true
    });

    this._trigger.next();
  }

  private getSummaryNoticeSetting() {
    return pipe(
      map(() => {
        const v: boolean = this.ls.getStorageObjectKeyValue({
          primaryKey: this._primaryKey,
          subKey: this._subKey
        });

        if (v !== undefined) {
          return false;
        } else {
          return true;
        }
      })
    );
  }
}

