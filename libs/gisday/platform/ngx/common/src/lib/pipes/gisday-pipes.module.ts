import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubmissionReviewStatusPipe } from './submission-review-status/submission-review-status.pipe';
import { AssetUrlPipe } from './asset-url/asset-url.pipe';
import { OrderByPipe } from './order-by/order-by.pipe';
import { ParseDateTimeStringsPipe } from './parse-date-time-strings/parse-date-time-strings.pipe';

const pipes = [AssetUrlPipe, OrderByPipe, ParseDateTimeStringsPipe, SubmissionReviewStatusPipe];

@NgModule({
  imports: [CommonModule],
  declarations: [...pipes],
  exports: [...pipes]
})
export class GISDayPipesModule {}
