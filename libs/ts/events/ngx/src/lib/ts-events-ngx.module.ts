import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SettingsGuard } from './guards/settings/settings.guard';
import { BuilderComponent } from './modules/builder/builder.component';

const routes: Routes = [
  {
    path: 'map',
    loadChildren: () => import('./modules/map/map.module').then((m) => m.MapModule),
    canActivate: [SettingsGuard]
  },
  {
    path: 'builder',
    component: BuilderComponent,
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
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }), PipesModule],
  declarations: [BuilderComponent],
  exports: [RouterModule]
})
export class TsEventsNgxModule {}
