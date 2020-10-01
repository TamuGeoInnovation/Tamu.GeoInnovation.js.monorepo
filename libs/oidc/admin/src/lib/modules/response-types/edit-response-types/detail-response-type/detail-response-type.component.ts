import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ResponseTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { ResponseType } from '@tamu-gisc/oidc/provider-nestjs';

@Component({
  selector: 'detail-response-type',
  templateUrl: './detail-response-type.component.html',
  styleUrls: ['./detail-response-type.component.css']
})
export class DetailResponseTypeComponent implements OnInit {
  public responseTypeGuid: string;
  public responseType: Partial<ResponseType>;
  public form: FormGroup;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private responseService: ResponseTypesService) {
    this.form = this.fb.group({
      guid: [''],
      type: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.params.responseTypeGuid) {
      this.responseTypeGuid = this.route.snapshot.params.responseTypeGuid;
      this.responseService.getResponseType(this.responseTypeGuid).subscribe((responseType) => {
        this.responseType = responseType;
        this.form.patchValue(this.responseType);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          const newResponseType = this.form.getRawValue();
          this.responseService
            .updateResponseType(this.form.getRawValue())
            .subscribe((result) => [console.log('Updated response type')]);
        });
      });
    }
  }
}
