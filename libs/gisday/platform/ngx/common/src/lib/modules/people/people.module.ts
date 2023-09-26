import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PresenterCardComponent } from './components/presenter-card/presenter-card.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { SpeakerAvatarComponent } from './components/speaker-avatar/speaker-avatar.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [PresenterCardComponent, SpeakerCardComponent, SpeakerAvatarComponent],
  exports: [PresenterCardComponent, SpeakerCardComponent, SpeakerAvatarComponent]
})
export class GisDayPeopleModule {}

