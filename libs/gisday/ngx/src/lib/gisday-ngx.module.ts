import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@tamu-gisc/gisday/data-access';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';

import { LandingModule } from './pages/landing/landing.module';
import { EventModule } from './pages/events/event.module';

@NgModule({
  imports: [CommonModule, LandingModule, EventModule],
  declarations: [FooterComponent, HeaderComponent],
  providers: [AuthService],
  exports: [FooterComponent, HeaderComponent, LandingModule, EventModule]
})
export class GisdayNgxModule {}
