import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleOptionQuestionComponent } from './multiple-option-question.component';

describe('MultipleOptionQuestionComponent', () => {
  let component: MultipleOptionQuestionComponent;
  let fixture: ComponentFixture<MultipleOptionQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleOptionQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleOptionQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
