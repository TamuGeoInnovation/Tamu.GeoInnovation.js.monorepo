import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import().then((m) => m.)
  }
]

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
