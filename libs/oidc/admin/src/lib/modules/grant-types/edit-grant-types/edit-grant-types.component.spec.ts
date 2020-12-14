import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGrantTypesComponent } from './edit-grant-types.component';

describe('EditGrantTypesComponent', () => {
  let component: EditGrantTypesComponent;
  let fixture: ComponentFixture<EditGrantTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGrantTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGrantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
