import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ReplaySubject } from 'rxjs';

import { DatabaseService } from '@tamu-gisc/geoservices/data-access';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class UploadComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  private db = inject(DatabaseService);

  public form: UntypedFormGroup;

  public delimiters = this.db.getTextDelimiterList();

  public qualifiers = this.db.getTextQualifierList();

  public file: ReplaySubject<File> = new ReplaySubject(1);

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
