import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@tamu-gisc/gisday/data-access';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';

import { LandingModule } from './pages/landing/landing.module';
import { SessionsModule } from './pages/sessions/sessions.module';

@NgModule({
  imports: [CommonModule, LandingModule, SessionsModule],
  declarations: [FooterComponent, HeaderComponent],
  providers: [AuthService],
  exports: [FooterComponent, HeaderComponent, LandingModule, SessionsModule]
})
export class GisdayNgxModule {}
