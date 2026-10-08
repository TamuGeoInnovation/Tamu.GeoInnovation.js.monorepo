import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../core/components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../core/components/footer/footer.component';

@Component({
  selector: 'tamu-gisc-geoservices-public',
  templateUrl: './geoservices-public.component.html',
  styleUrls: ['./geoservices-public.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderComponent, RouterOutlet, FooterComponent]
})
export class GeoservicesPublicComponent {}
