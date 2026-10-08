import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AddressMatchTypeAttributeListComponent } from '../address-match-type-attribute-list/address-match-type-attribute-list.component';
import { AddressFormatFragmentComponent } from '../../address-normalization/address-format-fragment/address-format-fragment.component';

@Component({
    selector: 'tamu-gisc-address-attribute-list',
    templateUrl: './address-attribute-list.component.html',
    styleUrls: ['./address-attribute-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AccordionDirective, AccordionHeaderDirective, AccordionContentDirective, AddressMatchTypeAttributeListComponent, AddressFormatFragmentComponent]
})
export class AddressAttributeListComponent {}
