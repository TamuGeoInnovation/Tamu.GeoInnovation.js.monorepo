import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipTriggerComponent } from './tooltip-trigger.component';

describe('TooltipTriggerComponent', () => {
  let component: TooltipTriggerComponent;
  let fixture: ComponentFixture<TooltipTriggerComponent>;
  let inputEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipTriggerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipTriggerComponent);
    component = fixture.componentInstance;
    inputEl = fixture.nativeElement.querySelector('button');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should repsond to Mouse Event', () => {
    const yeet = spyOn(component.triggerActivate, 'emit');
    const e: MouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    component.click(e);

    expect(yeet).toHaveBeenCalled();
  });
});
