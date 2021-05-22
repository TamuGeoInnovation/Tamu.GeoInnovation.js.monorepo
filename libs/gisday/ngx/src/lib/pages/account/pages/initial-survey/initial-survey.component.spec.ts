import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialSurveyComponent } from './initial-survey.component';

describe('InitialSurveyComponent', () => {
  let component: InitialSurveyComponent;
  let fixture: ComponentFixture<InitialSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitialSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
