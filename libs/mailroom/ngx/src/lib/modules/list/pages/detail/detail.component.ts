import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map, Observable, switchMap } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { MailroomEmail } from '@tamu-gisc/mailroom/common';

@Component({
  selector: 'tamu-gisc-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public $email: Observable<MailroomEmail>;

  constructor(private route: ActivatedRoute, private service: EmailService) {}

  public ngOnInit() {
    this.$email = this.route.params.pipe(
      map((params) => params['id']),
      switchMap((id) => {
        console.log(id);
        return this.service.getEmailWithAttachment(id);
      })
    );
  }
}

