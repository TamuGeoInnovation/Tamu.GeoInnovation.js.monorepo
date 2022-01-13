import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { FormsModule } from '@tamu-gisc/gisday/competitions/ngx/common';

import { DesignerComponent } from './designer.component';
import { DesignQuestionComponent } from './components/design-question/design-question.component';
import { DesignFormComponent } from './components/design-form/design-form.component';

const routes: Routes = [
  {
    path: '',
    component: DesignerComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule, UILayoutModule, FormsModule],
  declarations: [DesignerComponent, DesignQuestionComponent, DesignFormComponent]
})
export class DesignerModule {}
