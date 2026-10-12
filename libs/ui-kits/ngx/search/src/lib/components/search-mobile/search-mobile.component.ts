import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SearchService } from '../../services/search.service';
import { SearchComponent } from '../search/search.component';
import { NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-search-mobile',
  templateUrl: './search-mobile.component.html',
  styleUrls: ['../search/search.component.scss', './search-mobile.component.scss'],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, AsyncPipe, TitleCasePipe]
})
export class SearchMobileComponent extends SearchComponent {
  public emitLeftActionEvent(): void {
    if (this.leftActionIcon) {
      if (this.leftActionIcon === 'arrow_back') {
        this.loseFocus();
      }
      this.leftAction.emit();
    }
  }
}
