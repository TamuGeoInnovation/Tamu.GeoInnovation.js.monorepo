import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TsMoveinNgxModule } from '@tamu-gisc/ts/movein/ngx';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, TsMoveinNgxModule],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
