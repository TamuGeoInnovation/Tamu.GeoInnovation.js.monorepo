import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroupComponent } from './checkbox-group.component';

describe('CheckboxGroupComponent', () => {
  let component: CheckboxGroupComponent;
  let fixture: ComponentFixture<CheckboxGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxGroupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupComponent);
    component = fixture.componentInstance;

    // Provide @Input properties
    fixture.componentRef.setInput('referenceId', 'name');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate ngOnInit', () => {
    fixture.componentRef.setInput('referenceId', undefined);
    expect(() => {
      component.ngOnInit();
    }).toThrow();
  });

  it('should correctly evaluate writeValue', () => {
    component.writeValue(['reeee', 'reeee']);
    expect(component.value).toStrictEqual(['reeee', 'reeee']);
  });
});
