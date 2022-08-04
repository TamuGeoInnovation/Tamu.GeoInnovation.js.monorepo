import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss']
})
export class ExperimentsListComponent implements OnInit {
  public responsive: Observable<boolean>;

  constructor(private readonly rs: ResponsiveService) {}

  ngOnInit(): void {
    this.responsive = this.rs.isMobile;
  }
}
