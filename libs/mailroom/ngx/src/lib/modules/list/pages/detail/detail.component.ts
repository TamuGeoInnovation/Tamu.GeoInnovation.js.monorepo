import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Buffer } from 'buffer';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomAttachment, MailroomEmail } from '@tamu-gisc/mailroom/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public $email: Observable<MailroomEmail>;

  constructor(
    private route: ActivatedRoute,
    private service: EmailService,
    private ns: NotificationService,
    private location: Location
  ) {}

  public ngOnInit() {
    this.$email = this.route.params.pipe(
      map((params) => params['id']),
      switchMap((id) => {
        return this.service.getEmailWithAttachment(id);
      }),
      shareReplay(1)
    );
  }

  public attachmentToImage(attachment: MailroomAttachment) {
    const base64 = Buffer.from(attachment.blob.data as Uint8Array).toString('base64');
    return `"data:${attachment.mimeType};base64,${base64}"`;
  }

  public deleteEmail() {
    this.$email
      .pipe(
        map((email) => email.id),
        switchMap((id) => {
          return this.service.deleteEmail(id);
        })
      )
      .subscribe((removed) => {
        if (removed) {
          this.ns.preset('deleted_email_success');

          this.location.back();
        } else {
          this.ns.preset('deleted_email_failure');
        }
      });
  }
}
