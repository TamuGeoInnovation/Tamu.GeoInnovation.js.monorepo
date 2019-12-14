import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusListHeaderComponent } from './bus-list-header.component';

describe('BusListHeaderComponent', () => {
  let component: BusListHeaderComponent;
  let fixture: ComponentFixture<BusListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
