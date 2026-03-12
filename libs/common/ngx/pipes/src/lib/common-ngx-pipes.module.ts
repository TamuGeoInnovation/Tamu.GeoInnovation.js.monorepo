import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LookupPipe } from './object/lookup/lookup.pipe';

import { GroupByPipe } from './collections/group-by/group-by.pipe';
import { OrderByPipe } from './collections/order-by/order-by.pipe';
import { ExistsPipe } from './collections/exists/exists.pipe';
import { ToArrayPipe } from './collections/to-array/to-array.pipe';

import { DateRangePipe } from './date/date-range/date-range.pipe';
import { NearestDatePipe } from './date/nearest-date/nearest-date.pipe';
import { ToDatePipe } from './date/to-date/to-date.pipe';

import { TimeUntilPipe } from './transformation/time-until.pipe';
import { PhoneNumberFormatPipe } from './transformation/phone-number-format.pipe';

import { MarkdownParsePipe } from './parsing/markdown-parse.pipe';

import { SafeHtmlPipe } from './sanitation/safe-html.pipe';

import { TrimPipe } from './string/trim.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    GroupByPipe,
    OrderByPipe,
    MarkdownParsePipe,
    SafeHtmlPipe,
    TimeUntilPipe,
    PhoneNumberFormatPipe,
    ExistsPipe,
    LookupPipe,
    DateRangePipe,
    NearestDatePipe,
    ToDatePipe,
    ToArrayPipe,
    TrimPipe
  ],
  exports: [
    GroupByPipe,
    OrderByPipe,
    MarkdownParsePipe,
    SafeHtmlPipe,
    TimeUntilPipe,
    PhoneNumberFormatPipe,
    ExistsPipe,
    LookupPipe,
    DateRangePipe,
    NearestDatePipe,
    ToDatePipe,
    ToArrayPipe,
    TrimPipe
  ]
})
export class PipesModule {}
