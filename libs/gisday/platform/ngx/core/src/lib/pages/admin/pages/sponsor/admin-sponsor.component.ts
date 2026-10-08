import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-admin-sponsor',
  templateUrl: './admin-sponsor.component.html',
  styleUrls: ['./admin-sponsor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class AdminSponsorComponent {}
