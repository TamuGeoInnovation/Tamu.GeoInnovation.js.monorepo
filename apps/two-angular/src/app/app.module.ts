import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './modules/routing/routing.module';
import { FrameModule } from './modules/frame/frame.module';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, FrameModule],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
