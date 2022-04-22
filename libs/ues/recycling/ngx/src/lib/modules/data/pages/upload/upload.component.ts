import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ResultsService } from '../../../data-access/results/results.service';

@Component({
  selector: 'tamu-gisc-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  public form: FormGroup;
  public success = false;
  public error = false;

  constructor(private fb: FormBuilder, private resultsService: ResultsService) {}

  public ngOnInit() {
    this.form = this.fb.group({
      file: ['', Validators.required]
    });
  }

  public upload() {
    const formValue = this.form.getRawValue();

    const data: FormData = new FormData();

    data.append('file', formValue.file);

    this.resultsService.uploadData(data).subscribe(
      (res) => {
        console.log('Updated data', res);
        this.success = true;
      },
      () => {
        this.error = true;
      }
    );
  }
}
