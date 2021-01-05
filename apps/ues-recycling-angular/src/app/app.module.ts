import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          component: AppComponent,
          children: [
            {
              path: 'data',
              loadChildren: () => import('@tamu-gisc/ues/recycling/ngx').then((m) => m.DataModule)
            }
          ]
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
