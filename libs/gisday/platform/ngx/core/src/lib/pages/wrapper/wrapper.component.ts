import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderComponent, RouterOutlet, FooterComponent]
})
export class WrapperComponent {}
