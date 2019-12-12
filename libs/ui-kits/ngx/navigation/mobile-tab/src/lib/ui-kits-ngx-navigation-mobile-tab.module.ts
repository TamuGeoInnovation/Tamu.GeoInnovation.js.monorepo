import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileTabNavigation } from './components/container/container.component';
import { MobileTabNavigationTab } from './components/tab/tab.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MobileTabNavigation, MobileTabNavigationTab],
  exports: [MobileTabNavigation, MobileTabNavigationTab]
})
export class UINavigationMobileTabModule {}
