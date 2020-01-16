import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { BuilderComponent } from './components/builder/builder.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [BuilderComponent],
  exports: [BuilderComponent]
})
export class CPAFormsModule {}
