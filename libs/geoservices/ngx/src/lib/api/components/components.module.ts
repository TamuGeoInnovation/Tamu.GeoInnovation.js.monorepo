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

@NgModule({
  imports: [CommonModule, HighlightPlusModule, UILayoutModule],
  declarations: [
    ResponseViewerComponent,
    AddressAttributeListComponent,
    AddressMatchTypeAttributeListComponent,
    ReferenceFeatureAttributeListComponent,
    ReferenceFeatureInterpolationTypeAttributeListComponent,
    ReferenceFeatureInterpolationSubTypeAttributeListComponent
  ],
  exports: [
    ResponseViewerComponent,
    AddressAttributeListComponent,
    AddressMatchTypeAttributeListComponent,
    ReferenceFeatureAttributeListComponent,
    ReferenceFeatureInterpolationTypeAttributeListComponent,
    ReferenceFeatureInterpolationSubTypeAttributeListComponent
  ]
})
export class ApiComponentsModule {}
