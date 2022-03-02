import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';
import { debounceTime, tap } from 'rxjs/operators';
import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'tamu-gisc-participant-response-popup',
  templateUrl: './participant-response-popup.component.html',
  styleUrls: ['./participant-response-popup.component.scss']
})
export class ParticipantResponsePopupComponent extends BasePopupComponent implements OnInit {
  public form: FormGroup;

  constructor(private readonly vs: ViewerService, private readonly fb: FormBuilder) {
    super();
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      notes: [this.data?.attributes?.notes !== undefined ? this.data.attributes.notes : '', Validators.required]
    });

    this.form
      .get('notes')
      .valueChanges.pipe(debounceTime(300))
      .pipe(
        tap((v) => {
          this.data.setAttribute('notes', v);
        })
      )
      .subscribe((res) => {
        this.vs.forceSave();
      });
  }
}
