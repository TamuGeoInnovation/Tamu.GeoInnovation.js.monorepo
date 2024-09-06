import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthedComponent } from './not-authed.component';

describe('NotAuthedComponent', () => {
  let component: NotAuthedComponent;
  let fixture: ComponentFixture<NotAuthedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotAuthedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
