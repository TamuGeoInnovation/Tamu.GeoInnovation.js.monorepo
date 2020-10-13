import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleNormalQuestionComponent } from './scale-normal-question.component';

describe('ScaleNormalQuestionComponent', () => {
  let component: ScaleNormalQuestionComponent;
  let fixture: ComponentFixture<ScaleNormalQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleNormalQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleNormalQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
