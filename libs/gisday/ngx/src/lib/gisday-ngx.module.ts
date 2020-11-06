import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@tamu-gisc/gisday/data-access';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';

import { LandingModule } from './pages/landing/landing.module';
import { EventModule } from './pages/events/event.module';

@NgModule({
  imports: [CommonModule, LandingModule, EventModule, UITileNavigationModule, UINavigationTriggersModule],
  declarations: [FooterComponent, HeaderComponent],
  providers: [AuthService],
  exports: [FooterComponent, HeaderComponent, LandingModule, EventModule]
})
export class GisdayNgxModule {}
