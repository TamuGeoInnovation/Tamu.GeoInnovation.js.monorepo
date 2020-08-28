import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGrantTypesComponent } from './add-grant-types.component';

describe('AddGrantTypesComponent', () => {
  let component: AddGrantTypesComponent;
  let fixture: ComponentFixture<AddGrantTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGrantTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGrantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
