import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { SecretQuestion } from '@tamu-gisc/oidc/common';
import { UsersService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'tamu-gisc-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss']
})
export class AddUsersComponent implements OnInit {
  public password: FormGroup;
  public question: FormGroup;
  public $questions: Observable<Array<Partial<SecretQuestion>>>;

  constructor(private fb: FormBuilder, private userService: UsersService) {
    this.$questions = this.userService.getSecretQuestions();
  }

  public ngOnInit(): void {
    this.password = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      confirm_password: ['']
    });
    this.question = this.fb.group({
      question1: [''],
      answer1: [''],
      question2: [''],
      answer2: ['']
    });
  }

  public addUser() {
    // TODO: This method was referenced in the template but was never implemented.
    console.error('Not implemented.');
  }
}
