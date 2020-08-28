import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { GrantType } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-grant-type',
  templateUrl: './detail-grant-type.component.html',
  styleUrls: ['./detail-grant-type.component.scss']
})
export class DetailGrantTypeComponent implements OnInit {
  public grantTypeGuid: string;
  public grantType: Partial<GrantType>;
  public form: FormGroup;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private grantTypeService: GrantTypesService) {
    this.form = this.fb.group({
      guid: [''],
      name: ['', Validators.required],
      type: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.params.grantTypeGuid) {
      this.grantTypeGuid = this.route.snapshot.params.grantTypeGuid;
      this.grantTypeService.getGrantType(this.grantTypeGuid).subscribe((grantType) => {
        this.grantType = grantType;
        this.form.patchValue(this.grantType);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          const newGrantType = this.form.getRawValue();
          this.grantTypeService
            .updateGrantType(this.form.getRawValue())
            .subscribe((result) => [console.log('Updated grant type')]);
        });
      });
    }
  }
}
