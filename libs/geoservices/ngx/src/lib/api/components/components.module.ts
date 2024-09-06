import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ResponseViewerComponent } from './response-viewer/response-viewer.component';
import { AddressAttributeListComponent } from './fragments/common/address-attribute-list/address-attribute-list.component';
import { AddressMatchTypeAttributeListComponent } from './fragments/common/address-match-type-attribute-list/address-match-type-attribute-list.component';
import { ReferenceFeatureAttributeListComponent } from './fragments/common/reference-feature-attribute-list/reference-feature-attribute-list.component';
import { ReferenceFeatureInterpolationTypeAttributeListComponent } from './fragments/common/reference-feature-interpolation-type-attribute-list/reference-feature-interpolation-type-attribute-list.component';
import { ReferenceFeatureInterpolationSubTypeAttributeListComponent } from './fragments/common/reference-feature-interpolation-sub-type-attribute-list/reference-feature-interpolation-sub-type-attribute-list.component';
import { ApiVersionFragmentComponent } from './fragments/common/api-version-fragment/api-version-fragment.component';
import { QueryStatusFragmentComponent } from './fragments/common/query-status-fragment/query-status-fragment.component';
import { CensusYearsParameterFragmentComponent } from './fragments/common/census-years-parameter-fragment/census-years-parameter-fragment.component';
import { CensusRecordFragmentComponent } from './fragments/common/census-record-fragment/census-record-fragment.component';
import { AddressFormatFragmentComponent } from './fragments/address-normalization/address-format-fragment/address-format-fragment.component';
import { ServiceAttributeAccordionComponent } from './fragments/common/service-attribute-accordion/service-attribute-accordion.component';

@NgModule({
  imports: [CommonModule, HighlightPlusModule, UILayoutModule],
  declarations: [
    ResponseViewerComponent,
    AddressAttributeListComponent,
    AddressMatchTypeAttributeListComponent,
    ReferenceFeatureAttributeListComponent,
    ReferenceFeatureInterpolationTypeAttributeListComponent,
    ReferenceFeatureInterpolationSubTypeAttributeListComponent,
    ApiVersionFragmentComponent,
    QueryStatusFragmentComponent,
    CensusYearsParameterFragmentComponent,
    CensusRecordFragmentComponent,
    AddressFormatFragmentComponent,
    ServiceAttributeAccordionComponent
  ],
  exports: [
    ResponseViewerComponent,
    AddressAttributeListComponent,
    AddressMatchTypeAttributeListComponent,
    ReferenceFeatureAttributeListComponent,
    ReferenceFeatureInterpolationTypeAttributeListComponent,
    ReferenceFeatureInterpolationSubTypeAttributeListComponent,
    ApiVersionFragmentComponent,
    QueryStatusFragmentComponent,
    CensusYearsParameterFragmentComponent,
    CensusRecordFragmentComponent,
    AddressFormatFragmentComponent,
    ServiceAttributeAccordionComponent
  ]
})
export class ApiComponentsModule {}
