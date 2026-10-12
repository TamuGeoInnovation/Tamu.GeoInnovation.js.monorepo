import { Component, Input, ChangeDetectionStrategy, output } from '@angular/core';
import { TooltipComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TooltipTriggerComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-interactive-response-metadata',
  templateUrl: './interactive-response-metadata.component.html',
  styleUrls: ['./interactive-response-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TooltipComponent, TooltipTriggerComponent, DecimalPipe]
})
export class InteractiveResponseMetadataComponent {
  @Input()
  public status: string;

  @Input()
  public timeTaken: number;

  @Input()
  public guid: string;

  public readonly resetTrigger = output<null>();

  public readonly redirectTrigger = output<null>();

  public reset() {
    this.resetTrigger.emit(null);
  }

  public fullResponse() {
    this.redirectTrigger.emit(null);
  }
}
