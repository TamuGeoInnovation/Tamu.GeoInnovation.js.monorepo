import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-broadcasts',
  templateUrl: './broadcasts.component.html',
  styleUrls: ['./broadcasts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class BroadcastsComponent {}
