import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionContentComponent } from './accordion-content.component';

describe('AccordionContentComponent', () => {
  let component: AccordionContentComponent;
  let fixture: ComponentFixture<AccordionContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccordionContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
