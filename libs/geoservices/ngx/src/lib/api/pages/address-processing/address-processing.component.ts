import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AddressProcessing, AddressProcessingAddressFormat } from '@tamu-gisc/geoprocessing-v5';
import { RouterLink } from '@angular/router';
import { ServiceAttributeAccordionComponent } from '../../components/fragments/common/service-attribute-accordion/service-attribute-accordion.component';
import { AddressFormatFragmentComponent } from '../../components/fragments/address-normalization/address-format-fragment/address-format-fragment.component';
import { ApiVersionFragmentComponent } from '../../components/fragments/common/api-version-fragment/api-version-fragment.component';
import { QueryStatusFragmentComponent } from '../../components/fragments/common/query-status-fragment/query-status-fragment.component';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AddressAttributeListComponent } from '../../components/fragments/common/address-attribute-list/address-attribute-list.component';

@Component({
    selector: 'tamu-gisc-address-processing',
    templateUrl: './address-processing.component.html',
    styleUrls: ['./address-processing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, ServiceAttributeAccordionComponent, AddressFormatFragmentComponent, ApiVersionFragmentComponent, QueryStatusFragmentComponent, AccordionDirective, AccordionHeaderDirective, AccordionContentDirective, AddressAttributeListComponent]
})
export class AddressProcessingComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/addressnormalization/v5';

  public apiKey = 'demo';

  public runner: AddressProcessing = new AddressProcessing({
    apiKey: this.apiKey,
    nonParsedStreetAddress: '123 Old Del Mar',
    nonParsedStreetCity: 'Los Angeles',
    nonParsedStreetState: 'California',
    nonParsedStreetZIP: '900890255',
    addressFormat: [AddressProcessingAddressFormat.USPSPublication28]
  });
}
