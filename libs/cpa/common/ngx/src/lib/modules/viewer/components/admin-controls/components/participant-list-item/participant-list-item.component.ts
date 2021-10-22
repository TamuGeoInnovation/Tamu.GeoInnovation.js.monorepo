import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';

import { IParticipant } from '@tamu-gisc/cpa/common/entities';

@Component({
  selector: 'tamu-gisc-participant-list-item',
  templateUrl: './participant-list-item.component.html',
  styleUrls: ['./participant-list-item.component.scss']
})
export class ParticipantListItemComponent implements OnInit {
  @Input()
  public participant: IParticipant;

  @Output()
  public nameUpdated: EventEmitter<string> = new EventEmitter();

  @ViewChild('participantName')
  public label: ElementRef;

  public editable: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}

  public ngOnInit(): void {
    this.editable.pipe(skip(1), debounceTime(0)).subscribe((value) => {
      if (value) {
        this.label.nativeElement.focus();
      } else {
        this.nameUpdated.emit(this.label.nativeElement.textContent);
      }
    });
  }

  public makeEditable() {
    this.editable.next(true);
  }

  public makeUneditable() {
    this.editable.next(false);
  }
}
