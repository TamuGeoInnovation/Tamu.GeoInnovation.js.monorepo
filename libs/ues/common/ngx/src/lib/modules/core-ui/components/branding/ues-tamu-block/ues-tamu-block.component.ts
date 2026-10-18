import { Component, input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-ues-tamu-block',
  templateUrl: './ues-tamu-block.component.html',
  styleUrls: ['./ues-tamu-block.component.scss']
})
export class UESTamuBlockComponent {
  public readonly version = input<'positive' | 'negative'>('positive');
}
