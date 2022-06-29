import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, EnvironmentModule],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
