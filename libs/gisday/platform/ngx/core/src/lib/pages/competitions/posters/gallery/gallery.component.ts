import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable } from 'rxjs';

import { UserSubmission } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  public $posters: Observable<Array<Partial<UserSubmission>>>;

  constructor(private submissionService: UserSubmissionsService, private sanitizer: DomSanitizer) {}

  public ngOnInit() {
    this.$posters = this.submissionService.getPosters();
  }

  public getSanitizedLink(link: SafeHtml) {
    return this.sanitizer.sanitize(SecurityContext.URL, link);
  }
}
