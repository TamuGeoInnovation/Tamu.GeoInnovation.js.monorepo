import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-admin-detail-tag',
  templateUrl: './admin-detail-tag.component.html',
  styleUrls: ['./admin-detail-tag.component.scss']
})
export class AdminDetailTagComponent implements OnDestroy, OnInit {
  public entityGuid: string;
  public entity: Partial<Tag>;
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private tagService: TagService) {
    this.form = this.fb.group({
      guid: [''],
      name: ['']
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.params.guid) {
      this.entityGuid = this.route.snapshot.params.guid;
      this.tagService.getEntity(this.entityGuid).subscribe((entity) => {
        this.entity = entity;
        this.form.patchValue(this.entity);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          this.tagService.updateEntity(this.form.getRawValue()).subscribe((result) => [console.log('Updated details')]);
        });
      });
    }
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
