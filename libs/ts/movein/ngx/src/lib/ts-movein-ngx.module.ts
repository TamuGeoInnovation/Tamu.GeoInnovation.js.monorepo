import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  { path: 'map', loadChildren: () => import('./modules/map/map.module').then((m) => m.MapModule) },
  {
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })],
  declarations: [],
  exports: [RouterModule]
})
export class TsMoveinNgxModule {}
