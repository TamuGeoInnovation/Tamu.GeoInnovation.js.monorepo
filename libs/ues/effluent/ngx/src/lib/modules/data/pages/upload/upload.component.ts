import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  public form: FormGroup;

  constructor(private fb: FormBuilder) {}

  public ngOnInit() {
    this.form = this.fb.group({
      file: ['', Validators.required]
    });
  }

  public upload() {
    const fValue = this.form.getRawValue();
    debugger;
  }
}
