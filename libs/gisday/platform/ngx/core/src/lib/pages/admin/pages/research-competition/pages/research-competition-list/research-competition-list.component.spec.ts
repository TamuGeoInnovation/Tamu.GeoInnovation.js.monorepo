import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCompetitionListComponent } from './research-competition-list.component';

describe('ResearchCompetitionListComponent', () => {
  let component: ResearchCompetitionListComponent;
  let fixture: ComponentFixture<ResearchCompetitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResearchCompetitionListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchCompetitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
