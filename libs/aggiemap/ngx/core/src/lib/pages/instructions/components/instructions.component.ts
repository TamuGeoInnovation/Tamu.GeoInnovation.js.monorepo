import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FooterComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-aggiemap-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, FooterComponent]
})
export class InstructionsComponent {}
