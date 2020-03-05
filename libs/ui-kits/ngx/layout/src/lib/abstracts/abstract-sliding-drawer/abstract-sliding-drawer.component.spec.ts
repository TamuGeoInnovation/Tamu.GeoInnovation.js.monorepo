import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractSlidingDrawerComponent } from './abstract-sliding-drawer.component';

describe('AbstractSlidingDrawerComponent', () => {
  let component: AbstractSlidingDrawerComponent;
  let fixture: ComponentFixture<AbstractSlidingDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractSlidingDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractSlidingDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
