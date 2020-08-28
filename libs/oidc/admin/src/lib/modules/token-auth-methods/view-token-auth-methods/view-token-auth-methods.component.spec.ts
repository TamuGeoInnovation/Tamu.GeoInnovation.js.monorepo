import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTokenAuthMethodsComponent } from './view-token-auth-methods.component';

describe('ViewTokenAuthMethodsComponent', () => {
  let component: ViewTokenAuthMethodsComponent;
  let fixture: ComponentFixture<ViewTokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTokenAuthMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
