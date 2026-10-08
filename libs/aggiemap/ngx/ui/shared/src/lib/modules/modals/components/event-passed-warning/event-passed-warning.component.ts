import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

export interface EventPassedData {
  title?: string;
  message?: string;
  followupMessage?: string;
  acknowledgeText?: string;
}

@Component({
    selector: 'tamu-gisc-event-passed-warning',
    templateUrl: './event-passed-warning.component.html',
    styleUrls: ['./event-passed-warning.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ButtonComponent]
})
export class EventPassedWarningComponent {
  public title: string;
  public message: string;
  public followupMessage: string;
  public acknowledgeText: string;

  constructor(
    private readonly mr: ModalRefService,
    @Inject(MODAL_DATA) private readonly data: EventPassedData
  ) {
    this.title = data?.title || 'This event has passed';
    this.message =
      data?.message || 'The information on this map may be outdated and should be used for informational purposes only.';
    this.followupMessage =
      data?.followupMessage || 'A new map will be released as we get closer to the next upcoming date for this event.';
    this.acknowledgeText = data?.acknowledgeText || 'OK';
  }

  public acknowledge() {
    this.mr.close(true);
  }
}
