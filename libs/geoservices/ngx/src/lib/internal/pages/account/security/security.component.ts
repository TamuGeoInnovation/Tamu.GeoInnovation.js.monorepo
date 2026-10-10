import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { AccountSecurityService, ISecretQuestion } from '@tamu-gisc/geoservices/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, SelectComponent, AsyncPipe]
})
export class SecurityComponent implements OnInit {
  private service = inject(AccountSecurityService);
  private fb = inject(UntypedFormBuilder);

  public questions: Observable<Array<ISecretQuestion>>;

  public password: UntypedFormGroup;
  public question: UntypedFormGroup;

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
