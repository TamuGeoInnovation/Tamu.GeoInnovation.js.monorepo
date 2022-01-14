import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantResponsePopupComponent } from './participant-response-popup.component';

describe('ParticipantResponsePopupComponent', () => {
  let component: ParticipantResponsePopupComponent;
  let fixture: ComponentFixture<ParticipantResponsePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantResponsePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantResponsePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
