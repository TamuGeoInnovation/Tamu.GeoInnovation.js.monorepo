import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBaseComponent } from './request-base.component';

describe('RequestBaseComponent', () => {
  let component: RequestBaseComponent;
  let fixture: ComponentFixture<RequestBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
