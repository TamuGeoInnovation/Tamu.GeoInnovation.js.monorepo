import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeoservicesAdminComponent } from './geoservices-admin.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesAdminComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'configurations'
      },
      {
        path: 'configurations',
        loadChildren: () => import('./configurations/configurations.module').then((m) => m.ConfigurationsModule)
      },
      {
        path: 'databases',
        loadChildren: () => import('./databases/databases.module').then((m) => m.DatabasesModule)
      },
      {
        path: 'diagnostics',
        loadChildren: () => import('./diagnostics/diagnostics.module').then((m) => m.DiagnosticsModule)
      },
      {
        path: 'emails',
        loadChildren: () => import('./emails/emails.module').then((m) => m.EmailsModule)
      },
      {
        path: 'news',
        loadChildren: () => import('./news/news.module').then((m) => m.NewsModule)
      },
      {
        path: 'payments',
        loadChildren: () => import('./payments/payments.module').then((m) => m.PaymentsModule)
      },
      {
        path: 'processes',
        loadChildren: () => import('./processes/processes.module').then((m) => m.ProcessesModule)
      },
      {
        path: 'promotions',
        loadChildren: () => import('./promotions/promotions.module').then((m) => m.PromotionsModule)
      },
      {
        path: 'qa',
        loadChildren: () => import('./qa/qa.module').then((m) => m.QaModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule)
      },
      {
        path: 'security',
        loadChildren: () => import('./security/security.module').then((m) => m.SecurityModule)
      },
      {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions/subscriptions.module').then((m) => m.SubscriptionsModule)
      },
      {
        path: 'surveys',
        loadChildren: () => import('./surveys/surveys.module').then((m) => m.SurveysModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.module').then((m) => m.TransactionsModule)
      },
      {
        path: 'tiers',
        loadChildren: () => import('./tiers/tiers.module').then((m) => m.TiersModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule)
      },
      {
        path: 'soundex',
        loadChildren: () => import('./soundex/soundex.module').then((m) => m.SoundexModule)
      },
      {
        path: 'sales',
        loadChildren: () => import('./sales/sales.module').then((m) => m.SalesModule)
      },
      {
        path: 'charts1',
        loadChildren: () => import('./charts1/charts1.module').then((m) => m.Charts1Module)
      },
      {
        path: 'site-monitoring',
        loadChildren: () => import('./site-monitoring/site-monitoring.module').then((m) => m.SiteMonitoringModule)
      },
      {
        path: 'source-census-database',
        loadChildren: () =>
          import('./source-census-database/source-census-database.module').then((m) => m.SourceCensusDatabaseModule)
      },
      {
        path: 'admin-tools',
        loadChildren: () => import('./admin-tools/admin-tools.module').then((m) => m.AdminToolsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [GeoservicesAdminComponent],
  exports: [RouterModule]
})
export class GeoservicesAdminModule {}
