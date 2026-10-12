import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FooterComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-aggiemap-requesting-maps',
  templateUrl: './requesting-maps.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, FooterComponent]
})
export class RequestingMapsComponent {}
