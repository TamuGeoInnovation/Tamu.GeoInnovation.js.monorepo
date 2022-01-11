import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantGroupListComponent } from './participant-group-list.component';

describe('ParticipantGroupListComponent', () => {
  let component: ParticipantGroupListComponent;
  let fixture: ComponentFixture<ParticipantGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParticipantGroupListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
