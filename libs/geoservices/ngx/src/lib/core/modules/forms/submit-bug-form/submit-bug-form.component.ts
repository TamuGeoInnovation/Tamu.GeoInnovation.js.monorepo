import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-submit-bug-form',
  templateUrl: './submit-bug-form.component.html',
  styleUrls: ['./submit-bug-form.component.scss']
})
export class SubmitBugFormComponent implements OnInit {
  public form: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly ns: NotificationService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      subject: ['Bug report', Validators.required],
      body: ['', Validators.required]
    });
  }

  public sendMessage() {
    this.form.disable();

    this.ns.toast({
      id: 'bug-report-message-sent',
      title: 'Bug report sent successfully',
      message: 'Thank you for your feedback!'
    });
  }
}
