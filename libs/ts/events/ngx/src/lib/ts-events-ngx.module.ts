import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SettingsGuard } from './guards/settings/settings.guard';
import { BuilderComponent } from './modules/builder/builder.component';
import { BuilderAccessGuard } from './guards/builder-access/builder-access.guard';
import { EventEntryGuard } from './guards/event-entry/event-entry.guard';
import { RouteParamsGuard } from './guards/route-params/route-params.guard';
import { ENDED_PATH, RetiredEventGuard } from './guards/retired-event/retired-event.guard';
import { EndedComponent } from './modules/ended/ended.component';
import { EventSettingsQuery } from './services/settings/event-settings-query';
import { EventSettingsService } from './services/settings/event-settings.service';

const routes: Routes = [
  {
    path: ':eventId',
    canActivate: [RouteParamsGuard, EventEntryGuard],
    // A retired event opens its ended page, never its map or builder (#1098).
    canActivateChild: [RetiredEventGuard],
    children: [
      {
        path: ENDED_PATH,
        component: EndedComponent
      },
      {
        path: 'map',
        loadChildren: () => import('./modules/map/map.routes').then((m) => m.mapRoutes),
        canActivate: [SettingsGuard]
      },
      {
        path: 'builder',
        component: BuilderComponent,
        canActivate: [BuilderAccessGuard, SettingsGuard],
        children: [
          {
            path: 'intro',
            loadChildren: () => import('./modules/builder/modules/intro/intro.routes').then((m) => m.introRoutes)
          },
          {
            path: 'accommodations/:accommodation',
            loadChildren: () =>
              import('./modules/builder/modules/accommodations/accommodations.routes').then((m) => m.accommodationsRoutes)
          },
          {
            path: 'accommodations',
            loadChildren: () =>
              import('./modules/builder/modules/accommodations/accommodations.routes').then((m) => m.accommodationsRoutes)
          },
          {
            path: 'review',
            loadChildren: () => import('./modules/builder/modules/review/review.routes').then((m) => m.reviewRoutes)
          },
          { path: '', redirectTo: 'accommodations', pathMatch: 'full' }
        ]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'builder/accommodations'
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), BuilderComponent, EndedComponent],
  providers: [{ provide: EventSettingsQuery, useExisting: EventSettingsService }],
  exports: [RouterModule]
})
export class TsEventsNgxModule {}
