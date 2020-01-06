import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionHeaderComponent } from './accordion-header.component';
import { AccordionService } from '../services/accordion.service';

describe('AccordionHeaderComponent', () => {
  let component: AccordionHeaderComponent;
  let fixture: ComponentFixture<AccordionHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccordionHeaderComponent],
      providers: [AccordionService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
