import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
// import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
// import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/mailroom/ngx').then((m) => m.ListModule)
  }
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    // BrowserAnimationsModule,
    EnvironmentModule,
    // LocalStoreModule,
    NotificationModule,
    // UILayoutModule
    HttpClientModule
  ],
  declarations: [AppComponent],
  providers: [
    NotificationService,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
