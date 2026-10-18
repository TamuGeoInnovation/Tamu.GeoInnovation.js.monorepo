import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Observable, take } from 'rxjs';

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
  imports: [NgxDatatableModule, DatePipe]
})
export class SubmissionReviewListComponent implements OnInit {
  private readonly modalService = inject(ModalService);

  public readonly submissions$ = input<Observable<SubmissionReviewDto[]>>(undefined);
  public readonly isAdmin = input(false);

  public readonly submissions = signal<SubmissionReviewDto[]>([]);

  public ngOnInit(): void {
    this.submissions$().subscribe((submissions) => {
      this.submissions.set(submissions);
    });
  }

  public onRowClick(event: SwimlaneNgxDatatableActivateEvent) {
    if (event.type !== 'click') {
      return;
    }

    this.modalService
      .open<SubmissionReviewDto>(SubmissionDetailModalComponent, {
        data: {
          submission: event.row,
          isAdmin: this.isAdmin()
        }
      })
      .pipe(take(1))
      .subscribe((updated) => {
        // The modal changes the row's status in place. A new list makes the table draw it again.
        if (updated) {
          this.submissions.update((rows) => [...rows]);
        }
      });
  }
}
