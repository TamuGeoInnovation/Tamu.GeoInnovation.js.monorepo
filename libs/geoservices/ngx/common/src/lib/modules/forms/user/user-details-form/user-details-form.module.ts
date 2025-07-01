import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { UserDetailsFormComponent } from './user-details-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [UserDetailsFormComponent],
  exports: [UserDetailsFormComponent]
})
export class UserDetailsFormModule {}
