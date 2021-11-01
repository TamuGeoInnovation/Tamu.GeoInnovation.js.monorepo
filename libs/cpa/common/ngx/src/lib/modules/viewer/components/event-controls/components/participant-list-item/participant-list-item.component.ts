import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, skip, takeUntil } from 'rxjs/operators';

import { IParticipant } from '@tamu-gisc/cpa/common/entities';

@Component({
  selector: 'tamu-gisc-participant-list-item',
  templateUrl: './participant-list-item.component.html',
  styleUrls: ['./participant-list-item.component.scss']
})
export class ParticipantListItemComponent implements OnInit, OnDestroy {
  @Input()
  public participant: IParticipant;

  @Output()
  public nameUpdated: EventEmitter<string> = new EventEmitter();

  @Output()
  public deleted: EventEmitter<IParticipant> = new EventEmitter();

  @ViewChild('participantName')
  public label: ElementRef;

  public editable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public confirmationVisible: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public url: string;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private router: Router, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.editable.pipe(skip(1), debounceTime(0), takeUntil(this._$destroy)).subscribe((value) => {
      if (value) {
        this.label.nativeElement.focus();
      } else {
        this.nameUpdated.emit(this.label.nativeElement.textContent);
      }
    });

    this.createCopyUrl();
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public makeEditable() {
    this.editable.next(true);
  }

  public makeUneditable() {
    this.editable.next(false);
  }

  public createCopyUrl() {
    const currentTree = this.router.parseUrl(this.router.url);
    const params = currentTree.queryParams;

    // Since this url is going to be distributed to participants, they should not be able to see
    // the workshop controls.
    delete params.controls;

    params.participant = this.participant.guid;

    const tree = this.router.createUrlTree(['/viewer'], { queryParams: params });

    this.url = `${window.location.origin}/${tree.toString()}`;
  }

  public deleteParticipant() {
    this.deleted.emit(this.participant);
  }

  public promptConfirmation() {
    this.confirmationVisible.next(true);
  }

  public hideConfirmation() {
    this.confirmationVisible.next(false);
  }
}
