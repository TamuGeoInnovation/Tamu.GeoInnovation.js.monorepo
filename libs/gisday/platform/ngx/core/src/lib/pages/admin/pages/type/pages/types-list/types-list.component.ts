import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TYPE_PAGE } from '@tamu-gisc/gisday/platform/ngx/common';
import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import type { RsvpType, SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

/**
 * A type's list (#3328): every RSVP type or submission type, by name and when it changed. Types belong to no season, so
 * it lists them all. Which type comes from the route's TYPE_PAGE.
 */
@Component({
  selector: 'tamu-gisc-types-list',
  templateUrl: './types-list.component.html',
  imports: [RouterLink, AsyncPipe, DatePipe]
})
export class TypesListComponent extends BaseAdminListComponent<RsvpType | SubmissionType> {
  public readonly page = inject(TYPE_PAGE);
  protected readonly entityService = this.page.service as unknown as BaseService<RsvpType | SubmissionType>;
}
