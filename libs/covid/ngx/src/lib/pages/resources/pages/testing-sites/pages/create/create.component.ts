import { Component, OnInit } from '@angular/core';
import { TestingSitesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  public site: Observable<Partial<FormattedTestingSite>>;

  constructor(private siteService: TestingSitesService, private router: Router, private route: ActivatedRoute) {}

  public ngOnInit() {
    if (this.route.snapshot.params.siteGuid) {
      this.site = this.siteService.getTestingSiteDetails(this.route.snapshot.params.siteGuid);
    }
  }
}
