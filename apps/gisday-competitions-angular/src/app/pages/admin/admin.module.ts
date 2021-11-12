import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AdminComponent } from './admin.component';
import { DesignQuestionComponent } from './components/design-question/design-question.component';
import { DesignFormComponent } from './components/design-form/design-form.component';
import { FormsModule } from '../../modules/forms/forms.module';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent
  }
];
@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule, UILayoutModule, FormsModule],
  declarations: [AdminComponent, DesignQuestionComponent, DesignFormComponent]
})
export class AdminModule {}
