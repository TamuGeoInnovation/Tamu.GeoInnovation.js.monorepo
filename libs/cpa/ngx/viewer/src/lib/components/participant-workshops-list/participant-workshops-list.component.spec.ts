import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantWorkshopsListComponent } from './participant-workshops-list.component';

describe('ParticipantWorkshopsListComponent', () => {
  let component: ParticipantWorkshopsListComponent;
  let fixture: ComponentFixture<ParticipantWorkshopsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParticipantWorkshopsListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantWorkshopsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
