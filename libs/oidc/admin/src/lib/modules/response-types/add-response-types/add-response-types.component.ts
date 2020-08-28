import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ResponseTypesService } from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add-response-types',
  templateUrl: './add-response-types.component.html',
  styleUrls: ['./add-response-types.component.scss']
})
export class AddResponseTypesComponent implements OnInit {
  public form: FormGroup;
  constructor(private fb: FormBuilder, private responseService: ResponseTypesService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  public submitResponseType() {
    this.responseService.createResponseType(this.form.value);
  }
}
