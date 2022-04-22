import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileTabNavigationComponent } from './components/container/container.component';
import { MobileTabNavigationTabComponent } from './components/tab/tab.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MobileTabNavigationComponent, MobileTabNavigationTabComponent],
  exports: [MobileTabNavigationComponent, MobileTabNavigationTabComponent]
})
export class UINavigationMobileTabModule {}
