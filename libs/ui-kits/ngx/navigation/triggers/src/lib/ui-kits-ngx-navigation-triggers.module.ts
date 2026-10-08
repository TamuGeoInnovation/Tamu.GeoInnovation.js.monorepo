import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HamburgerTriggerComponent } from './components/hamburger-trigger/hamburger-trigger.component';

@NgModule({
    imports: [CommonModule, HamburgerTriggerComponent],
    exports: [HamburgerTriggerComponent]
})
export class UINavigationTriggersModule {}
