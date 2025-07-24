import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { TierBenefit } from '@tamu-gisc/geoservices/data-api';

import { AdminTierService } from '../../services/admin-tier/admin-tier.service';

@Component({
  selector: 'tamu-gisc-category-benefit-add-edit-form',
  templateUrl: './category-benefit-add-edit-form.component.html',
  styleUrls: ['./category-benefit-add-edit-form.component.scss']
})
export class CategoryBenefitAddEditFormComponent {
  @Input()
  public benefit: FormGroup;

  @Output()
  public benefitDelete: EventEmitter<TierBenefit> = new EventEmitter<TierBenefit>();

  public benefitValueTypes = [
    { label: 'Numeric', value: 'numeric' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'String', value: 'string' }
  ];

  constructor(private readonly ats: AdminTierService) {}

  public removeBenefit(): void {
    this.benefitDelete.emit(this.benefit.value);
  }
}
