import { Component, inject } from '@angular/core';

import { SearchResultSelectionService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { SearchComponent } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent } from '@tamu-gisc/maps/feature/legend';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss'],
  imports: [SearchComponent, LayerListComponent, LegendComponent]
})
export class SidebarReferenceComponent<T extends esri.Graphic> {
  private searchSelection = inject(SearchResultSelectionService);

  public onSearchResult(result: SearchSelection<T>) {
    this.searchSelection.show(result);
  }
}
