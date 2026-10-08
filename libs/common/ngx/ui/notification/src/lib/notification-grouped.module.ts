import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import { NotificationGroupedComponent } from './components/notification-grouped/notification-grouped.component';

/**
 * Grouped notifications, kept out of `NotificationModule` on purpose.
 *
 * Fourteen applications render a notification container; one groups them. Declaring the grouped
 * component alongside the plain one shipped roughly 5kB of grouping to the other thirteen, which pushed
 * `correction-lite-angular` past its 1MB initial-bundle budget - a budget five times tighter than its
 * siblings, and deliberately so. That application has since been removed (#1339); the reason stands.
 *
 * Import this only where grouping is actually used.
 */
@NgModule({
    imports: [CommonModule, LocalStoreModule, NotificationGroupedComponent],
    exports: [NotificationGroupedComponent]
})
export class NotificationGroupedModule {}
