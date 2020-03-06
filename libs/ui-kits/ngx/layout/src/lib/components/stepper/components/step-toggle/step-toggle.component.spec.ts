import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepToggleComponent } from './step-toggle.component';

describe('StepToggleComponent', () => {
  let component: StepToggleComponent;
  let fixture: ComponentFixture<StepToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
