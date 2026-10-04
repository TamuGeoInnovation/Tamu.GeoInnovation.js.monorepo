import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

import { CodeMaroonAlertComponent } from './code-maroon-alert.component';

/**
 * The Code Maroon alert overlay (#1289). Imported by the application shell so the alert can sit over
 * the ordinary map without the map module knowing anything about it.
 */
@NgModule({
  declarations: [CodeMaroonAlertComponent],
  exports: [CodeMaroonAlertComponent],
  imports: [CommonModule, RouterModule, UIFormsModule, TestingModule],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class CodeMaroonAlertModule {}
