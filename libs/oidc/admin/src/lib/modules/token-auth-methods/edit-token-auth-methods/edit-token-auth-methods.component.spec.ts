import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTokenAuthMethodsComponent } from './edit-token-auth-methods.component';

describe('EditTokenAuthMethodsComponent', () => {
  let component: EditTokenAuthMethodsComponent;
  let fixture: ComponentFixture<EditTokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTokenAuthMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
