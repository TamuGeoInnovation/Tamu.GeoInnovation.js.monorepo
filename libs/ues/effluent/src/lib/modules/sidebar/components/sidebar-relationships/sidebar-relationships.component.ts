import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, switchMap, map } from 'rxjs/operators';

import { EsriMapService, HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { SearchService } from '@tamu-gisc/search';

import esri = __esri;
import { PopupService } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-sidebar-relationships',
  templateUrl: './sidebar-relationships.component.html',
  styleUrls: ['./sidebar-relationships.component.scss']
})
export class SidebarRelationshipsComponent implements OnInit, OnDestroy {
  public tier: Observable<string>;
  public sample;
  public location;

  public hit: Observable<HitTestSnapshot>;
  constructor(private ms: EsriMapService, private ss: SearchService<esri.Graphic>, private ps: PopupService) {}

  public ngOnInit(): void {
    this.ps.suppressPopups();

    this.hit = this.ms.hitTest.pipe(shareReplay(1));

    this.tier = this.hit.pipe(
      map((snapshot) => {
        const [graphic] = snapshot.graphics;
        return graphic && graphic.attributes && graphic.attributes.Tier !== undefined ? graphic.attributes.Tier : undefined;
      })
    );
  }

  public ngOnDestroy() {
    this.ps.enablePopups();
  }
}
