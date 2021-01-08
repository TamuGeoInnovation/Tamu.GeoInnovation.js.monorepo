import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

import { DatabaseService } from '@tamu-gisc/geoservices/data-access';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  public form: FormGroup;

  public delimiters = this.db.getTextDelimiterList();

  public qualifiers = this.db.getTextQualifierList();

  public file: ReplaySubject<FileComponent> = new ReplaySubject(1);

  constructor(private fb: FormBuilder, private db: DatabaseService) {}

  public ngOnInit() {
    this.form = this.fb.group({
      file: ['', Validators.required],
      txtDelimiter: [','],
      txtQualifier: ['"']
    });
  }

  public upload() {
    console.log(this.form.getRawValue());
  }
}
