import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerAvatarComponent } from './speaker-avatar.component';

describe('SpeakerAvatarComponent', () => {
  let component: SpeakerAvatarComponent;
  let fixture: ComponentFixture<SpeakerAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeakerAvatarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakerAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
