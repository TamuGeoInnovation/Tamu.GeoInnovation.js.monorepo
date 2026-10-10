import { Routes } from '@angular/router';

import { CompetitionsComponent } from './competitions.component';

export const competitionsRoutes: Routes = [
  {
    path: '',
    component: CompetitionsComponent,
    children: [
      {
        path: 'highschool',
        loadChildren: () => import('./highschool/highschool.routes').then((m) => m.highschoolRoutes)
      },
      {
        path: 'feedback',
        loadChildren: () => import('./feedback/feedback.routes').then((m) => m.feedbackRoutes)
      },
      {
        path: 'papers',
        loadChildren: () => import('./papers/papers.routes').then((m) => m.papersRoutes)
      },
      {
        path: 'presentation',
        loadChildren: () => import('./presentation/presentation.routes').then((m) => m.presentationRoutes)
      },
      {
        path: 'posters',
        loadChildren: () => import('./posters/posters.routes').then((m) => m.postersRoutes)
      },
      {
        path: 'posters/gallery',
        loadChildren: () => import('./posters/gallery/gallery.routes').then((m) => m.galleryRoutes)
      },
      {
        path: 'vgi',
        loadChildren: () => import('./vgi/vgi.routes').then((m) => m.vgiRoutes)
      },
      {
        path: 'signage',
        loadChildren: () => import('./signage/signage.routes').then((m) => m.signageRoutes)
      },
      {
        path: 'stormwater',
        loadChildren: () => import('./stormwater/stormwater.routes').then((m) => m.stormwaterRoutes)
      },
      {
        path: 'sidewalk',
        loadChildren: () => import('./sidewalk/sidewalk.routes').then((m) => m.sidewalkRoutes)
      },
      {
        path: 'lighting',
        loadChildren: () => import('./lighting/lighting.routes').then((m) => m.lightingRoutes)
      },
      {
        path: 'lightpole',
        loadChildren: () => import('./light-pole/light-pole.routes').then((m) => m.lightPoleRoutes)
      },
      {
        path: 'building-bounty',
        loadChildren: () => import('./building-bounty/building-bounty.routes').then((m) => m.buildingBountyRoutes)
      },
      {
        path: 'aggie-accessibility',
        loadChildren: () =>
          import('./aggie-accessibility/aggie-accessibility.routes').then((m) => m.aggieAccessibilityRoutes)
      },
      {
        path: 'manhole',
        loadChildren: () => import('./manhole-mapping/manhole-mapping.routes').then((m) => m.manholeMappingRoutes)
      },
      {
        path: 'curb-cuts',
        loadChildren: () => import('./curb-cuts/curb-cuts.routes').then((m) => m.curbCutsRoutes)
      },
      {
        path: 'art',
        loadChildren: () => import('./art/art.routes').then((m) => m.artRoutes)
      },
      {
        path: 'aggie-map',
        loadChildren: () => import('./aggie-map/aggie-map.routes').then((m) => m.aggieMapRoutes)
      },
      {
        path: '',
        loadChildren: () => import('./landing/landing.routes').then((m) => m.landingRoutes)
      }
    ]
  }
];
