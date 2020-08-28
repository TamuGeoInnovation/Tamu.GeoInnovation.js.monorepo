import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTokenAuthMethodsComponent } from './add-token-auth-methods.component';

describe('AddTokenAuthMethodsComponent', () => {
  let component: AddTokenAuthMethodsComponent;
  let fixture: ComponentFixture<AddTokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTokenAuthMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
