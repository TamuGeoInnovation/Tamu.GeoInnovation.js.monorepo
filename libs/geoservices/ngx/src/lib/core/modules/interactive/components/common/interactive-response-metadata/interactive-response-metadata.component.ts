import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'tamu-gisc-interactive-response-metadata',
  templateUrl: './interactive-response-metadata.component.html',
  styleUrls: ['./interactive-response-metadata.component.scss']
})
export class InteractiveResponseMetadataComponent {
  @Input()
  public status: string;

  @Input()
  public timeTaken: number;

  @Input()
  public guid: string;

  @Output()
  public resetTrigger: EventEmitter<null> = new EventEmitter();

  @Output()
  public redirectTrigger: EventEmitter<null> = new EventEmitter();

  public reset() {
    this.resetTrigger.emit(null);
  }

  public fullResponse() {
    this.redirectTrigger.emit(null);
  }
}
