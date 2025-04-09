import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupByPipe } from './collections/group-by.pipe';
import { OrderByPipe } from './collections/order-by.pipe';
import { ExistsPipe } from './collections/exists.pipe';

import { MarkdownParsePipe } from './parsing/markdown-parse.pipe';
import { SafeHtmlPipe } from './sanitation/safe-html/safe-html.pipe';
import { SafeUrlPipe } from './sanitation/safe-url/safe-url.pipe';

import { TimeUntilPipe } from './transformation/time-until.pipe';
import { PhoneNumberFormatPipe } from './transformation/phone-number-format.pipe';

import { LookupPipe } from './object/lookup/lookup.pipe';

@NgModule({
  declarations: [
    GroupByPipe,
    OrderByPipe,
    MarkdownParsePipe,
    SafeHtmlPipe,
    TimeUntilPipe,
    PhoneNumberFormatPipe,
    ExistsPipe,
    LookupPipe,
    SafeUrlPipe
  ],
  imports: [CommonModule],
  exports: [
    GroupByPipe,
    OrderByPipe,
    MarkdownParsePipe,
    SafeHtmlPipe,
    TimeUntilPipe,
    PhoneNumberFormatPipe,
    ExistsPipe,
    LookupPipe,
    SafeUrlPipe
  ]
})
export class PipesModule {}
