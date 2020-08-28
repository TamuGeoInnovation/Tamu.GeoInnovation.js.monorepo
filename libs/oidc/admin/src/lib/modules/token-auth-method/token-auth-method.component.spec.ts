import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAuthMethodComponent } from './token-auth-method.component';

describe('TokenAuthMethodComponent', () => {
  let component: TokenAuthMethodComponent;
  let fixture: ComponentFixture<TokenAuthMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenAuthMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenAuthMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
