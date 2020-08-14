import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss']
})
export class AddUsersComponent implements OnInit {
  public password: FormGroup;
  public question: FormGroup;
  // public $questions:
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.password = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      confirm_password: ['']
    });
    this.question = this.fb.group({
      question: [''],
      answer: ['']
    });
  }
}
