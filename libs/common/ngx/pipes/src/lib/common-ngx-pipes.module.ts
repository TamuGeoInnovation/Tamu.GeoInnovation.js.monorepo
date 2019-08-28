import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupByPipe } from './collections/group-by.pipe';
import { OrderByPipe } from './collections/order-by.pipe';

import { MarkdownParsePipe } from './parsing/markdown-parse.pipe';
import { SafeHtmlPipe } from './sanitation/safe-html.pipe';

import { TimeUntilPipe } from './transformation/time-util.pipe';

@NgModule({
  declarations: [GroupByPipe, OrderByPipe, MarkdownParsePipe, SafeHtmlPipe, TimeUntilPipe],
  imports: [CommonModule],
  exports: [GroupByPipe, OrderByPipe, MarkdownParsePipe, SafeHtmlPipe, TimeUntilPipe]
})
export class CommonNgxPipesModule {}
