import { Component, OnInit, SecurityContext, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable } from 'rxjs';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NgClass, AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, AsyncPipe]
})
export class GalleryComponent implements OnInit {
  public $posters: Observable<Array<Partial<Submission>>>;

  constructor(
    private submissionService: UserSubmissionsService,
    private sanitizer: DomSanitizer
  ) {}

  public ngOnInit() {
    this.$posters = this.submissionService.getPosters();
  }

  public getSanitizedLink(link: SafeHtml) {
    return this.sanitizer.sanitize(SecurityContext.URL, link);
  }
}
