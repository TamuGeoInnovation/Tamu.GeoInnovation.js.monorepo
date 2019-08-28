import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import { NotificationContainerComponent } from './components/notification-container/notification-container.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';

@NgModule({
  declarations: [NotificationContainerComponent, NotificationItemComponent, NotificationContainerComponent],
  imports: [CommonModule, LocalStoreModule],
  exports: [NotificationContainerComponent, NotificationItemComponent]
})
export class NotificationModule {}
