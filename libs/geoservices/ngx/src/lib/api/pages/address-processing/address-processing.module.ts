import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AddressProcessingComponent } from './address-processing.component';


const routes: Routes = [
  {
    path: '',
    component: AddressProcessingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HighlightPlusModule,
    UIClipboardModule,
    UILayoutModule,
    AddressProcessingComponent
]
})
export class AddressProcessingModule {}
