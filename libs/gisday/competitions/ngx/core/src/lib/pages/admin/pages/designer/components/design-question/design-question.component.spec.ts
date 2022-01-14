import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignQuestionComponent } from './design-question.component';

describe('DesignQuestionComponent', () => {
  let component: DesignQuestionComponent;
  let fixture: ComponentFixture<DesignQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DesignQuestionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
