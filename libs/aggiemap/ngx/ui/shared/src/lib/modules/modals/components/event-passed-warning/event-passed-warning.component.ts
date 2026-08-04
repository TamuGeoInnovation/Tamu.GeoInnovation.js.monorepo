import { Component, Inject } from '@angular/core';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

export interface EventPassedData {
  title?: string;
  message?: string;
  acknowledgeText?: string;
}

@Component({
  selector: 'tamu-gisc-event-passed-warning',
  templateUrl: './event-passed-warning.component.html',
  styleUrls: ['./event-passed-warning.component.scss']
})
export class EventPassedWarningComponent {
  public title: string;
  public message: string;
  public acknowledgeText: string;

  constructor(private readonly mr: ModalRefService, @Inject(MODAL_DATA) private readonly data: EventPassedData) {
    this.title = data?.title || 'This event has passed';
    this.message =
      data?.message ||
      "This event has passed. The information on this map may be outdated and should be used for informational purposes only. A new map will be released as we get closer to the date.";
    this.acknowledgeText = data?.acknowledgeText || 'OK';
  }

  public acknowledge() {
    this.mr.close(true);
  }
}
