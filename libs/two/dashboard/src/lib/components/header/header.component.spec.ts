import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TWOHeaderComponent } from './header.component';

describe('TWOHeaderComponent', () => {
  let component: TWOHeaderComponent;
  let fixture: ComponentFixture<TWOHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TWOHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TWOHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
