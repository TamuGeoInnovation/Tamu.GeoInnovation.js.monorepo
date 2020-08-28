import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailTokenAuthMethodComponent } from './detail-token-auth-method.component';

describe('DetailTokenAuthMethodComponent', () => {
  let component: DetailTokenAuthMethodComponent;
  let fixture: ComponentFixture<DetailTokenAuthMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailTokenAuthMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailTokenAuthMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
