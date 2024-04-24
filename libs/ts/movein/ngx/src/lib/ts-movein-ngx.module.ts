import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuilderComponent } from './modules/builder/builder.component';
import { IntroModule } from './modules/builder/modules/intro/intro.module';
import { DateSelectModule } from './modules/builder/modules/date-select/date-select.module';
import { ZoneSelectModule } from './modules/builder/modules/zone-select/zone-select.module';
import { ZoneSelectComponent } from './modules/builder/modules/zone-select/zone-select.component';
import { AccommodationsModule } from './modules/builder/modules/accommodations/accommodations.module';
import { ReviewModule } from './modules/builder/modules/review/review.module';

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
      // { path: 'date/:returnState', component: DateSelectModule },
      // { path: 'date', component: DateSelectModule },
      // { path: 'zone/:returnState', component: ZoneSelectModule },
      // { path: 'zone', component: ZoneSelectComponent },
      // { path: 'accommodations/:returnState', component: AccomodationsModule },
      // { path: 'accommodations', component: AccomodationsModule },
      // { path: 'review', component: ReviewModule },
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
