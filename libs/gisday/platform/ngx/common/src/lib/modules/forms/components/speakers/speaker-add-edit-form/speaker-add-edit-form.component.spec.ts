import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerAddEditFormComponent } from './speaker-add-edit-form.component';

describe('SpeakerAddEditFormComponent', () => {
  let component: SpeakerAddEditFormComponent;
  let fixture: ComponentFixture<SpeakerAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpeakerAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakerAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
