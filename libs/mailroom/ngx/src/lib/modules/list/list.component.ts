import { Component, OnInit } from '@angular/core';

import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomEmail } from '@tamu-gisc/mailroom/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { DeleteEmailModalComponent } from './modal/delete-email-modal.component';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  private _$refresh: Subject<boolean> = new Subject();
  public $emails: Observable<Array<MailroomEmail>>;

  constructor(
    public readonly emailService: EmailService,
    private ns: NotificationService,
    private readonly modal: ModalService
  ) {}

  public ngOnInit() {
    this.$emails = this._$refresh.pipe(
      startWith(true),
      switchMap(() => {
        return this.emailService.getEmails().pipe(shareReplay(1));
      })
    );
  }

  public deleteEmail(email: MailroomEmail) {
    this.modal
      .open<{ deleted: boolean }>(DeleteEmailModalComponent, {
        data: {
          message: email.id
        }
      })
      .subscribe(({ deleted }) => {
        if (deleted) {
          this.ns.preset('deleted_email_success');

          this._$refresh.next(true);
        } else {
          this.ns.preset('deleted_email_failure');
        }
      });
  }
}
