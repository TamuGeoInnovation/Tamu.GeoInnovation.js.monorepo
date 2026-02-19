import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  { path: 'map', loadChildren: () => import('./pages/map/map.module').then((m) => m.MapModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule) },
  { path: 'changelog', loadChildren: () => import('./pages/changelog/changelog.module').then((m) => m.ChangelogModule) },
  { path: 'directory', loadChildren: () => import('./pages/directory/directory.module').then((m) => m.DirectoryModule) },
  {
    path: 'discover',
    loadChildren: () => import('@tamu-gisc/aggiemap/ngx/discover').then((m) => m.DiscoverModule)
  },
  { path: 'feedback', loadChildren: () => import('./pages/feedback/feedback.module').then((m) => m.FeedbackModule) },
  { path: 'privacy', loadChildren: () => import('./pages/privacy/privacy.module').then((m) => m.PrivacyModule) },
  {
    path: 'instructions',
    loadChildren: () => import('./pages/instructions/instructions.module').then((m) => m.InstructionsModule)
  },
  {
    path: 'events',
    loadChildren: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.TsEventsNgxModule)
  },
  {
    path: 'parking',
    loadChildren: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.TsEventsNgxModule)
  },
  {
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(hybridRoutes, {})],
  declarations: [],
  exports: [RouterModule]
})
export class AggiemapNgxCoreModule {}
