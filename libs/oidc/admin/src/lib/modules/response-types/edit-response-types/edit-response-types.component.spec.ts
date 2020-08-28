import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResponseTypesComponent } from './edit-response-types.component';

describe('EditResponseTypesComponent', () => {
  let component: EditResponseTypesComponent;
  let fixture: ComponentFixture<EditResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditResponseTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
