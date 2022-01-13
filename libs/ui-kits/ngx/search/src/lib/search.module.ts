import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchComponent } from './components/search/search.component';
import { SearchMobileComponent } from './components/search-mobile/search-mobile.component';
import { SearchResultPipe } from './pipes/search-result.pipe';

@NgModule({
  imports: [CommonModule],
  providers: [],
  declarations: [SearchComponent, SearchMobileComponent, SearchResultPipe],
  exports: [SearchComponent, SearchMobileComponent, SearchResultPipe]
})
export class SearchModule {}
