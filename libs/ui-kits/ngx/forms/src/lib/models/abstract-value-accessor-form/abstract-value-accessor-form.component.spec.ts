import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractValueAccessorFormComponent } from './abstract-value-accessor-form.component';

describe('AbstractValueAccessorFormComponent', () => {
  let component: AbstractValueAccessorFormComponent<{}>;
  let fixture: ComponentFixture<AbstractValueAccessorFormComponent<{}>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractValueAccessorFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractValueAccessorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
