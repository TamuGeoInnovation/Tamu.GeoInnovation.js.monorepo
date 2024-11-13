import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCompetitionReviewComponent } from './research-competition-review.component';

describe('ResearchCompetitionReviewComponent', () => {
  let component: ResearchCompetitionReviewComponent;
  let fixture: ComponentFixture<ResearchCompetitionReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResearchCompetitionReviewComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchCompetitionReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
