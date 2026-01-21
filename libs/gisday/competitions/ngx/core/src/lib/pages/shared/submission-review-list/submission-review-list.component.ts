import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { SubmissionDetailModalComponent } from '../submission-detail-modal/submission-detail-modal.component';

interface SwimlaneNgxDatatableActivateEvent {
  type: 'click' | 'dblclick' | 'keydown' | 'contextmenu' | 'mouseenter' | 'mouseleave';
  event: MouseEvent | KeyboardEvent;
  row: SubmissionReviewDto;
  column?: unknown;
  cellElement?: HTMLElement;
}

@Component({
  selector: 'tamu-gisc-submission-review-list',
  templateUrl: './submission-review-list.component.html',
  styleUrls: ['./submission-review-list.component.scss']
})
export class SubmissionReviewListComponent implements OnInit {
  @Input() public submissions$: Observable<SubmissionReviewDto[]>;
  @Input() public isAdmin = false;

  public submissions: SubmissionReviewDto[] = [];

  constructor(private readonly modalService: ModalService) {}

  public ngOnInit(): void {
    this.submissions$.subscribe((submissions) => {
      this.submissions = submissions;
    });
  }

  public onRowClick(event: SwimlaneNgxDatatableActivateEvent) {
    if (event.type !== 'click') {
      return;
    }

    this.modalService.open(SubmissionDetailModalComponent, {
      data: {
        submission: event.row,
        isAdmin: this.isAdmin
      }
    });
  }
}
