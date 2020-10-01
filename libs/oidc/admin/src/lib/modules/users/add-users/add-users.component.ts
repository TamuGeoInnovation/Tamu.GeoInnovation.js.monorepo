import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { SecretQuestion } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';
import { UsersService } from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add-users',
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

  ngOnInit(): void {
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

  public addUser() {}
}
