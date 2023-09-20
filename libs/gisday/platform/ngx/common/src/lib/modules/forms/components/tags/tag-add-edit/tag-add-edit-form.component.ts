import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';
import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-tag-add-edit-form',
  templateUrl: './tag-add-edit-form.component.html',
  styleUrls: ['./tag-add-edit-form.component.scss']
})
export class TagAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Tag>>;
  public form: FormGroup;

  constructor(private fb: FormBuilder, private at: ActivatedRoute, private ts: TagService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      name: ['']
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ts.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue(entity);
      });
    }
  }

  public updateEntity() {
    const rawValue = this.form.getRawValue();

    this.ts.updateEntity(rawValue.guid, rawValue).subscribe((result) => {
      console.log('Updated', result);
    });
  }
}

