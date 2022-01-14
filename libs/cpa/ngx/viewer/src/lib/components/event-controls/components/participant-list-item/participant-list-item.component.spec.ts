import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantListItemComponent } from './participant-list-item.component';

describe('ParticipantListItemComponent', () => {
  let component: ParticipantListItemComponent;
  let fixture: ComponentFixture<ParticipantListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParticipantListItemComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
