import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AccountSecurityService, ISecretQuestion } from '@tamu-gisc/geoservices/modules/data-access';

@Component({
  selector: 'tamu-gisc-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  public questions: Observable<Array<ISecretQuestion>>;

  public password: FormGroup;
  public question: FormGroup;

  constructor(private service: AccountSecurityService, private fb: FormBuilder) {}

  public ngOnInit() {
    this.password = this.fb.group({
      password1: ['', Validators.required],
      password2: ['', Validators.required]
    });

    this.question = this.fb.group({
      Question: [''],
      Answer: ['']
    });

    this.questions = this.service.getSecretQuestions();

    this.service.getActiveSecretQuestion().subscribe((aq) => {
      this.question.patchValue(aq);
    });
  }
}
