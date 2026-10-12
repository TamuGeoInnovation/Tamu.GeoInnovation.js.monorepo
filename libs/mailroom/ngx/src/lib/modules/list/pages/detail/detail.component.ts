import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location, AsyncPipe } from '@angular/common';

import { Buffer } from 'buffer';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomAttachment, MailroomEmail } from '@tamu-gisc/mailroom/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { DeleteEmailModalComponent } from '../../modal/delete-email-modal.component';

@Component({
  selector: 'tamu-gisc-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, AsyncPipe]
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private emailService = inject(EmailService);
  private ns = inject(NotificationService);
  private readonly modal = inject(ModalService);

  public $email: Observable<MailroomEmail>;

  public ngOnInit() {
    this.$email = this.route.params.pipe(
      map((params) => params['id']),
      switchMap((id) => {
        return this.emailService.getEmailWithAttachment(id);
      }),
      shareReplay(1)
    );
  }

  public attachmentToImage(attachment: MailroomAttachment) {
    const base64 = Buffer.from(attachment.blob.data as Uint8Array).toString('base64');
    return `"data:${attachment.mimeType};base64,${base64}"`;
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

          this.location.back();
        } else {
          this.ns.preset('deleted_email_failure');
        }
      });
  }
}
