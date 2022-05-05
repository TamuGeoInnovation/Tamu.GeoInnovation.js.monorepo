import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRoutingComponent } from './auth-routing.component';

describe('AuthRoutingComponent', () => {
  let component: AuthRoutingComponent;
  let fixture: ComponentFixture<AuthRoutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthRoutingComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

