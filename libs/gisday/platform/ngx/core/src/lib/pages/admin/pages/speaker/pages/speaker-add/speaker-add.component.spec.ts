import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerAddComponent } from './speaker-add.component';

describe('SpeakerAddComponent', () => {
  let component: SpeakerAddComponent;
  let fixture: ComponentFixture<SpeakerAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeakerAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
