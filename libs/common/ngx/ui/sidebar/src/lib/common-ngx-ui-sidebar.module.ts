import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarTabComponent } from './components/tab/tab.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SidebarComponent, SidebarTabComponent],
  exports: [SidebarComponent, SidebarTabComponent]
})
export class SidebarModule {}
