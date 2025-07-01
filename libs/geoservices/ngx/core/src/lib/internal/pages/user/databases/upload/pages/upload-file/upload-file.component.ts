import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, ReplaySubject } from 'rxjs';

import { DatabaseService } from '@tamu-gisc/geoservices/ngx/data-access';

@Component({
  selector: 'tamu-gisc-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  public form: FormGroup;

  public delimiters = this.db.getTextDelimiterList();

  public qualifiers = this.db.getTextQualifierList();

  public file: ReplaySubject<File> = new ReplaySubject(1);

  public fileExtension: Observable<string>;

  constructor(private fb: FormBuilder, private db: DatabaseService) {}

  public ngOnInit() {
    this.form = this.fb.group({
      file: ['', Validators.required],
      txtDelimiter: [','],
      txtQualifier: ['"']
    });

    // Something is up with this. The piped value is inferred as an observable but it should be a File.
    // Debug later. These components are not used at the moment anyways.
    this.fileExtension = this.file.pipe(() => {
      return of('');
    });
  }

  public upload() {
    console.log(this.form.getRawValue());
  }
}
