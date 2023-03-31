import { Component, Input } from '@angular/core';

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
}

