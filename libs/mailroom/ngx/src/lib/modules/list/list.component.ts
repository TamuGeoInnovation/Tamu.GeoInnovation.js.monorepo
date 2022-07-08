import { Component, OnInit } from '@angular/core';

import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomEmail } from '@tamu-gisc/mailroom/common';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  private _$refresh: Subject<boolean> = new Subject();
  public $emails: Observable<Array<MailroomEmail>>;

  constructor(public readonly emailService: EmailService) {}

  public ngOnInit() {
    this.$emails = this._$refresh.pipe(
      startWith(true),
      switchMap(() => {
        return this.emailService.getEmails().pipe(shareReplay(1));
      })
    );
  }

  public deleteEmail(email: MailroomEmail) {
    this.emailService.deleteEmail(email.id).subscribe(() => {
      // this.notificationService.preset();

      this._$refresh.next(true);
    });
  }
}
