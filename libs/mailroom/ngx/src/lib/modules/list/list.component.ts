import { Component, OnInit } from '@angular/core';

import { filter, switchMap, tap, Observable } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomEmail } from '@tamu-gisc/mailroom/common';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public $emails: Observable<Array<MailroomEmail>>;
  public searchString: string;

  constructor(public readonly emailService: EmailService) {}

  public ngOnInit() {
    this.$emails = this.emailService.getEmails().pipe();
    // switchMap((emails) => emails)
    // filter((email) => email.to.includes(this.searchString))
  }
}
