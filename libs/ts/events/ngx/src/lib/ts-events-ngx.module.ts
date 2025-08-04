import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SettingsGuard } from './guards/settings/settings.guard';
import { BuilderComponent } from './modules/builder/builder.component';
import { RouteParamsGuard } from './guards/route-params/route-params.guard';

const routes: Routes = [
  {
    path: ':eventId',
    canActivate: [RouteParamsGuard],
    children: [
      {
        path: 'map',
        loadChildren: () => import('./modules/map/map.module').then((m) => m.MapModule),
        canActivate: [SettingsGuard]
      },
      {
        path: 'builder',
        component: BuilderComponent,
        canActivate: [SettingsGuard],
        children: [
          {
            path: 'intro',
            loadChildren: () => import('./modules/builder/modules/intro/intro.module').then((m) => m.IntroModule)
          },
          {
            path: 'accommodations/:accommodation',
            loadChildren: () =>
              import('./modules/builder/modules/accommodations/accommodations.module').then((m) => m.AccommodationsModule)
          },
          {
            path: 'accommodations',
            loadChildren: () =>
              import('./modules/builder/modules/accommodations/accommodations.module').then((m) => m.AccommodationsModule)
          },
          {
            path: 'review',
            loadChildren: () => import('./modules/builder/modules/review/review.module').then((m) => m.ReviewModule)
          },
          { path: '', redirectTo: 'intro', pathMatch: 'full' }
        ]
      }
    ]
  }
  // {
  //   path: '',
  //   pathMatch: 'full',

  // },
  // {
  //   path: '**',
  //   redirectTo: ':eventId/map'
  // }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PipesModule],
  declarations: [BuilderComponent],
  exports: [RouterModule]
})
export class TsEventsNgxModule {}
