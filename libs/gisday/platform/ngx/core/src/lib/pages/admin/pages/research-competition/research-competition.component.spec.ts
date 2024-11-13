import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchCompetitionComponent } from './research-competition.component';

describe('ResearchCompetitionComponent', () => {
  let component: ResearchCompetitionComponent;
  let fixture: ComponentFixture<ResearchCompetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResearchCompetitionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
