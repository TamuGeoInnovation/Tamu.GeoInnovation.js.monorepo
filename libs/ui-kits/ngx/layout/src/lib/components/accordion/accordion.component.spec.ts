import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';

import { AccordionService } from './services/accordion.service';

// Mock testing component to emulate ContentChildren title and content components.
/*@Component({
  template: `
    <tamu-gisc-accordion-header></tamu-gisc-accordion-header>
    <tamu-gisc-accordion-content></tamu-gisc-accordion-content>
  `
})
class TestComponent {
  @ViewChild(AccordionHeaderComponent, { static: true })
  public title: AccordionHeaderComponent;

  @ViewChild(AccordionContentComponent, { static: true })
  public content: AccordionContentComponent;
}*/

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
