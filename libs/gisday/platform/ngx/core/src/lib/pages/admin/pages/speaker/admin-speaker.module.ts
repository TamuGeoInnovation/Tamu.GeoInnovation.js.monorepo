import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AdminSpeakerComponent } from './admin-speaker.component';
import { SpeakerListComponent } from './pages/speaker-list/speaker-list.component';
import { SpeakerAddComponent } from './pages/speaker-add/speaker-add.component';
import { SpeakerEditComponent } from './pages/speaker-edit/speaker-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSpeakerComponent,
    children: [
      {
        path: 'edit/:guid',
        component: SpeakerEditComponent
      },
      {
        path: 'add',
        component: SpeakerAddComponent
      },
      {
        path: '',
        component: SpeakerListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule, UIFormsModule, PipesModule],
  declarations: [AdminSpeakerComponent, SpeakerListComponent, SpeakerAddComponent, SpeakerEditComponent],
  exports: [RouterModule]
})
export class AdminSpeakerModule {}
