import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryQuestionComponent } from './binary-question.component';

describe('BinaryQuestionComponent', () => {
  let component: BinaryQuestionComponent;
  let fixture: ComponentFixture<BinaryQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinaryQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinaryQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
