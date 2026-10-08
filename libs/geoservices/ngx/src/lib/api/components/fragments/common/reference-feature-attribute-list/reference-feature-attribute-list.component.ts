import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AddressAttributeListComponent } from '../address-attribute-list/address-attribute-list.component';
import { ReferenceFeatureInterpolationTypeAttributeListComponent } from '../reference-feature-interpolation-type-attribute-list/reference-feature-interpolation-type-attribute-list.component';
import { ReferenceFeatureInterpolationSubTypeAttributeListComponent } from '../reference-feature-interpolation-sub-type-attribute-list/reference-feature-interpolation-sub-type-attribute-list.component';

@Component({
    selector: 'tamu-gisc-reference-feature-attribute-list',
    templateUrl: './reference-feature-attribute-list.component.html',
    styleUrls: ['./reference-feature-attribute-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AccordionDirective, AccordionHeaderDirective, AccordionContentDirective, AddressAttributeListComponent, ReferenceFeatureInterpolationTypeAttributeListComponent, ReferenceFeatureInterpolationSubTypeAttributeListComponent]
})
export class ReferenceFeatureAttributeListComponent {}
