import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmissionReviewListComponent } from './submission-review-list/submission-review-list.component';
import { SubmissionDetailModalComponent } from './submission-detail-modal/submission-detail-modal.component';

@NgModule({
  declarations: [SubmissionReviewListComponent, SubmissionDetailModalComponent],
  imports: [CommonModule, NgxDatatableModule, UILayoutModule, EsriMapModule, UIFormsModule],
  exports: [SubmissionReviewListComponent, SubmissionDetailModalComponent]
})
export class SubmissionReviewSharedModule {}
