import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, UserInfoService } from '@tamu-gisc/gisday/data-access';
import { Observable, Subject } from 'rxjs';
import { debounceTime, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnDestroy, OnInit {
  public form: FormGroup;
  public $userDetails: Observable<Partial<any>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private readonly userInfoService: UserInfoService) {
    // this.fetchEntity();
    this.form = this.fb.group({
      uin: [''],
      fieldOfStudy: [''],
      classification: [''],
      participantType: ['']
    });
  }

  ngOnInit(): void {
    // this.userInfoService.getEntityWithUserGuid().subscribe((result) => {
    //   console.log(result);
    // });
    this.userInfoService.getEntityWithUserGuid().subscribe((result) => {
      if (result !== null) {
        this.form.patchValue(result);
      }
      this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
        this.userInfoService.updateEntity(this.form.getRawValue()).subscribe((results) => {
          [console.log('Updated entity')];
        });
      });
    });
  }

  ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntity() {
    // this.$userDetails = this.authService.getUserRole().pipe(shareReplay(1));
    // this.authService.getUserRole().subscribe((result) => {
    //   console.log(result);
    // });
    // this.authService.state().subscribe((result) => {
    //   console.log(result);
    // });
  }
}
