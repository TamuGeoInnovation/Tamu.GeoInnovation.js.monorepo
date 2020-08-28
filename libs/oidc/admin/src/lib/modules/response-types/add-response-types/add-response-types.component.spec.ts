import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResponseTypesComponent } from './add-response-types.component';

describe('AddResponseTypesComponent', () => {
  let component: AddResponseTypesComponent;
  let fixture: ComponentFixture<AddResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddResponseTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
