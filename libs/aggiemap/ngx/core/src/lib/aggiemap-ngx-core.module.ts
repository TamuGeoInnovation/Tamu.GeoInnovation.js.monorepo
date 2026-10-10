import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  { path: 'map', loadChildren: () => import('./pages/map/map.routes').then((m) => m.mapRoutes) },
  { path: 'about', loadChildren: () => import('./pages/about/about.routes').then((m) => m.aboutRoutes) },
  { path: 'changelog', loadChildren: () => import('./pages/changelog/changelog.routes').then((m) => m.changelogRoutes) },
  { path: 'directory', loadChildren: () => import('./pages/directory/directory.routes').then((m) => m.directoryRoutes) },
  {
    path: 'all-maps',
    loadChildren: () => import('@tamu-gisc/aggiemap/ngx/discover').then((m) => m.discoverRoutes)
  },
  {
    path: 'discover',
    redirectTo: 'all-maps'
  },
  { path: 'feedback', loadChildren: () => import('./pages/feedback/feedback.routes').then((m) => m.feedbackRoutes) },
  {
    path: 'instructions',
    loadChildren: () => import('./pages/instructions/instructions.routes').then((m) => m.instructionsRoutes)
  },
  {
    path: 'requesting-maps',
    loadChildren: () => import('./pages/requesting-maps/requesting-maps.routes').then((m) => m.requestingMapsRoutes)
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
    path: 'operations',
    loadChildren: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.TsEventsNgxModule)
  },
  {
    path: 'campus',
    loadChildren: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.TsEventsNgxModule)
  },
  {
    // Sidebar-free, preset-layer maps meant to be embedded elsewhere (e.g. a mobile app webview).
    // Kept as its own top-level segment (rather than under `events`/`parking`/`operations`) so all
    // present and future "kiosk" maps stay grouped together.
    path: 'kiosk',
    loadChildren: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.TsEventsNgxModule)
  },
  {
    // Code Maroon proof of concept (#1289): the ordinary map, with the live emergency feed shown
    // over it. Loads the map module unchanged - the alert is an overlay in the application shell, so
    // nothing about the map has to know this route exists.
    //
    // Development only. The overlay checks `isTesting` itself before it renders or fetches anything,
    // so reaching this path on production shows the plain map and nothing else.
    path: 'code-maroon',
    loadChildren: () => import('./pages/map/map.routes').then((m) => m.mapRoutes)
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
