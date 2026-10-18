import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { BasemapOverrideComponent } from '../basemap-override/basemap-override.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss'],
  imports: [BasemapOverrideComponent, AsyncPipe]
})
export class ExperimentsListComponent implements OnInit {
  private readonly rs = inject(ResponsiveService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public responsive: Observable<boolean>;

  ngOnInit(): void {
    this.responsive = this.rs.isMobile;
  }

  /** Back to the sidebar's main page, as the basemap gallery, layer list and legend do (#1909). */
  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
