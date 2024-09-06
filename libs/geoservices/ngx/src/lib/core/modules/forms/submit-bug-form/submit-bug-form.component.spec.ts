import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitBugFormComponent } from './submit-bug-form.component';

describe('SubmitBugFormComponent', () => {
  let component: SubmitBugFormComponent;
  let fixture: ComponentFixture<SubmitBugFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmitBugFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitBugFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
