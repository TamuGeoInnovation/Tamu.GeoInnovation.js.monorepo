import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';

import { AccordionService } from './services/accordion.service';

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<AccordionComponent>;
  let component: AccordionComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccordionComponent],
      providers: [AccordionService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
