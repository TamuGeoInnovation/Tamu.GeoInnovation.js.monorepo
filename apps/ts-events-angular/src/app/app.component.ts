import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from '../../../../libs/common/ngx/ui/notification/src/lib/components/notification-container/notification-container.component';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NotificationContainerComponent]
})
export class AppComponent {
  title = 'ts-events-angular';
}
