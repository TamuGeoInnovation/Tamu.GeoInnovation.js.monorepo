import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapboxMapService, MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CompetitionsComponent } from './competitions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PapersComponent } from './papers/papers.component';
import { PostersComponent } from './posters/posters.component';
import { VgiComponent } from './vgi/vgi.component';

import { SignageComponent } from './signage/signage.component';
import { StormwaterComponent } from './stormwater/stormwater.component';
import { SidewalkComponent } from './sidewalk/sidewalk.component';
import { BuildingBountyComponent } from './building-bounty/building-bounty.component';
import { AggieAccessibilityComponent } from './aggie-accessibility/aggie-accessibility.component';
import { ManholeMappingComponent } from './manhole-mapping/manhole-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: CompetitionsComponent
  },
  {
    path: 'feedback',
    component: FeedbackComponent
  },
  {
    path: 'papers',
    component: PapersComponent
  },
  {
    path: 'posters',
    component: PostersComponent
  },
  {
    path: 'vgi',
    component: VgiComponent
  },
  {
    path: 'signage',
    component: SignageComponent
  },
  {
    path: 'stormwater',
    component: StormwaterComponent
  },
  {
    path: 'sidewalk',
    component: SidewalkComponent
  },
  {
    path: 'building-bounty',
    component: BuildingBountyComponent
  },
  {
    path: 'aggie-accessibility',
    component: AggieAccessibilityComponent
  },
  {
    path: 'manhole',
    component: ManholeMappingComponent
  }
];

@NgModule({
  declarations: [
    AggieAccessibilityComponent,
    BuildingBountyComponent,
    CompetitionsComponent,
    FeedbackComponent,
    ManholeMappingComponent,
    PapersComponent,
    PostersComponent,
    SidewalkComponent,
    SignageComponent,
    StormwaterComponent,
    VgiComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, UILayoutModule],
  exports: [RouterModule]
})
export class CompetitionsModule {}
