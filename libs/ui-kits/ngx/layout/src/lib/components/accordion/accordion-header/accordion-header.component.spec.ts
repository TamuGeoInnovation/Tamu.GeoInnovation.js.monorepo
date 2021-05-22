import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionHeaderComponent } from './accordion-header.component';
import { AccordionService } from '../services/accordion.service';
import { BehaviorSubject } from 'rxjs';

describe('AccordionHeaderComponent', () => {
  let component: AccordionHeaderComponent;
  let fixture: ComponentFixture<AccordionHeaderComponent>;
  let AccordionServiceStub: Partial<AccordionService>;
  const mockHelper = new BehaviorSubject({ expanded: false, animate: false, resize: false });

  AccordionServiceStub = {
    state: mockHelper.asObservable(),
    toggle(property: string) {
      const updated = this.mockHelper.getValue();
      updated[property] = !updated[property];
      this.mockHelper.next(updated);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccordionHeaderComponent],
      providers: [{ provide: AccordionService, useValue: AccordionServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionHeaderComponent);
    component = fixture.componentInstance;
    AccordionServiceStub = TestBed.get(AccordionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
