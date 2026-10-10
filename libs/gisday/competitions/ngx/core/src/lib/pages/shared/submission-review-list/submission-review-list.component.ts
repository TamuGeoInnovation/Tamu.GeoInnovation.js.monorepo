import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { SubmissionDetailModalComponent } from '../submission-detail-modal/submission-detail-modal.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';

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
  styleUrls: ['./submission-review-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgxDatatableModule, DatePipe]
})
export class SubmissionReviewListComponent implements OnInit {
  private readonly modalService = inject(ModalService);

  @Input() public submissions$: Observable<SubmissionReviewDto[]>;
  @Input() public isAdmin = false;

  public submissions: SubmissionReviewDto[] = [];

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
