import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAttributeAccordionComponent } from './service-attribute-accordion.component';

describe('ServiceAttributeAccordionComponent', () => {
  let component: ServiceAttributeAccordionComponent;
  let fixture: ComponentFixture<ServiceAttributeAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceAttributeAccordionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceAttributeAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
