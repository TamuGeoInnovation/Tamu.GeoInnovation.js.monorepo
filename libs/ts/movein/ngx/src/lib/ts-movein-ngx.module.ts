import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuilderComponent } from './modules/builder/builder.component';

const routes: Routes = [
  { path: 'map', loadChildren: () => import('./modules/map/map.module').then((m) => m.MapModule) },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'builder'
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
        path: 'date',
        loadChildren: () =>
          import('./modules/builder/modules/date-select/date-select.module').then((m) => m.DateSelectModule)
      },
      {
        path: 'zone',
        loadChildren: () =>
          import('./modules/builder/modules/zone-select/zone-select.module').then((m) => m.ZoneSelectModule)
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
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })],
  declarations: [BuilderComponent],
  exports: [RouterModule]
})
export class TsMoveinNgxModule {}
