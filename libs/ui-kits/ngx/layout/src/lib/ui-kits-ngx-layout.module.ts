import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { TooltipTriggerComponent } from './components/tooltip-trigger/tooltip-trigger.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TooltipComponent, TooltipTriggerComponent],
  exports: [TooltipComponent, TooltipTriggerComponent]
})
export class UILayoutModule {}
