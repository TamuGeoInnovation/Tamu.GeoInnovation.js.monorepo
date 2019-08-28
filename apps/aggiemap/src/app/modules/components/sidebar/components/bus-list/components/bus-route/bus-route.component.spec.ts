import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteComponent } from './bus-route.component';

describe('BusRouteComponent', () => {
  let component: BusRouteComponent;
  let fixture: ComponentFixture<BusRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
