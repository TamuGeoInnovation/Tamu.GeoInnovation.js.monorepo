import { Routes } from '@angular/router';

import { AdminSpeakerComponent } from './admin-speaker.component';
import { SpeakerListComponent } from './pages/speaker-list/speaker-list.component';
import { SpeakerAddComponent } from './pages/speaker-add/speaker-add.component';
import { SpeakerEditComponent } from './pages/speaker-edit/speaker-edit.component';

export const adminSpeakerRoutes: Routes = [
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
