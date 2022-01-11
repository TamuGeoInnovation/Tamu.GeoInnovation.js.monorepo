import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAuthMethodsComponent } from './token-auth-methods.component';

describe('TokenAuthMethodsComponent', () => {
  let component: TokenAuthMethodsComponent;
  let fixture: ComponentFixture<TokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenAuthMethodsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
