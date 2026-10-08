import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { BasemapOverrideComponent } from '../basemap-override/basemap-override.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BasemapOverrideComponent, AsyncPipe]
})
export class ExperimentsListComponent implements OnInit {
  public responsive: Observable<boolean>;

  constructor(private readonly rs: ResponsiveService) {}

  ngOnInit(): void {
    this.responsive = this.rs.isMobile;
  }
}
