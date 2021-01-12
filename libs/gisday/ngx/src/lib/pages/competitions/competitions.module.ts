import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapboxMapService, MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CompetitionsComponent } from './competitions.component';

const routes: Routes = [
  {
    path: '',
    component: CompetitionsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./landing/landing.module').then((m) => m.LandingModule)
      },
      {
        path: 'highschool',
        loadChildren: () => import('./highschool/highschool.module').then((m) => m.HighschoolModule)
      },
      {
        path: 'feedback',
        loadChildren: () => import('./feedback/feedback.module').then((m) => m.FeedbackModule)
      },
      {
        path: 'papers',
        loadChildren: () => import('./papers/papers.module').then((m) => m.PapersModule)
      },
      {
        path: 'posters',
        loadChildren: () => import('./posters/posters.module').then((m) => m.PostersModule)
      },
      {
        path: 'vgi',
        loadChildren: () => import('./vgi/vgi.module').then((m) => m.VgiModule)
      },
      {
        path: 'signage',
        loadChildren: () => import('./signage/signage.module').then((m) => m.SignageModule)
      },
      {
        path: 'stormwater',
        loadChildren: () => import('./stormwater/stormwater.module').then((m) => m.StormwaterModule)
      },
      {
        path: 'sidewalk',
        loadChildren: () => import('./sidewalk/sidewalk.module').then((m) => m.SidewalkModule)
      },
      {
        path: 'building-bounty',
        loadChildren: () => import('./building-bounty/building-bounty.module').then((m) => m.BuildingBountyModule)
      },
      {
        path: 'aggie-accessibility',
        loadChildren: () =>
          import('./aggie-accessibility/aggie-accessibility.module').then((m) => m.AggieAccessibilityModule)
      },
      {
        path: 'manhole',
        loadChildren: () => import('./manhole-mapping/manhole-mapping.module').then((m) => m.ManholeMappingModule)
      }
    ]
  }
];

@NgModule({
  declarations: [CompetitionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, UILayoutModule],
  exports: [RouterModule]
})
export class CompetitionsModule {}
