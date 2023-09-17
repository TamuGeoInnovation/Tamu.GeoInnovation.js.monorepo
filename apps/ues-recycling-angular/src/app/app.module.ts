import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import * as WebFont from 'webfontloader';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LegacyAuthGuard, LegacyAuthInterceptorProvider } from '@tamu-gisc/common/ngx/auth';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: 'data',
          loadChildren: () => import('@tamu-gisc/ues/recycling/ngx').then((m) => m.DataModule),
          canActivate: [LegacyAuthGuard]
        },
        {
          path: '',
          loadChildren: () => import('@tamu-gisc/ues/recycling/ngx').then((m) => m.MapModule)
        }
      ],
      { initialNavigation: 'enabled' }
    )
  ],
  providers: [
    EnvironmentService,
    {
      provide: env,
      useValue: environment
    },
    LegacyAuthInterceptorProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
