import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { UserInfoService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnDestroy, OnInit {
  public form: FormGroup;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private readonly userInfoService: UserInfoService) {
    this.form = this.fb.group({
      uin: [''],
      fieldOfStudy: [''],
      classification: [''],
      participantType: ['']
    });
  }

  public ngOnInit(): void {
    this.fetchEntity();
  }

  public ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntity() {
    this.userInfoService.getEntityWithUserGuid().subscribe((result) => {
      if (result !== null) {
        this.form.patchValue(result);
      }
      this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
        this.userInfoService.updateEntity(this.form.getRawValue()).subscribe((results) => {
          console.log('Updated entity', results);
        });
      });
    });
  }
}
