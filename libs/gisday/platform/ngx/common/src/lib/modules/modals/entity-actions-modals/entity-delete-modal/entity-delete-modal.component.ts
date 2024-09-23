import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-entity-delete-modal',
  templateUrl: './entity-delete-modal.component.html',
  styleUrls: ['./entity-delete-modal.component.scss']
})
export class EntityDeleteModalComponent implements OnInit {
  public form: FormGroup;
  public matchingConfirmationCount$: Observable<boolean>;

  public get entityType(): string {
    // If entityType is not defined, return 'entity'
    if (this.data.entityType === undefined) return 'entity';

    if (this.data.identities.length > 1) {
      if (this.data.pluralEntityType) {
        return this.data.pluralEntityType;
      } else {
        return this.data.entityType + 's';
      }
    } else {
      return this.data.entityType;
    }
  }

  constructor(
    @Inject(MODAL_DATA) public readonly data: EntityDeleteData,
    private readonly modalRef: ModalRefService,
    private readonly fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    console.log(`EntityDeleteModalComponent initialized`);

    this.form = this.fb.group({
      confirmationCount: [null, Validators.required]
    });

    this.matchingConfirmationCount$ = this.form.get('confirmationCount').valueChanges.pipe(
      map((value: string) => {
        return this.data.identities.length === parseInt(value, 10);
      }),
      startWith(false)
    );
  }

  public confirmDeleteEntities() {
    // This can only be reached when the form is valid so no need for additional checks
    this.modalRef.close({
      delete: true,
      identities: this.data.identities
    });
  }

  public cancelDeleteEntities() {
    this.modalRef.close({
      delete: false
    });
  }
}

export interface EntityDeleteData {
  entityType: string;
  pluralEntityType?: string;
  identities: Array<string>;
}

export interface EntityDeleteModalResponse {
  delete: boolean;
  identities: Array<string>;
}
