import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipTriggerComponent } from './tooltip-trigger.component';

describe('TooltipTriggerComponent', () => {
  let component: TooltipTriggerComponent;
  let fixture: ComponentFixture<TooltipTriggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TooltipTriggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
