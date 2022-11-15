import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusListBottomComponent } from './bus-list-bottom.component';

describe('BusListBottomComponent', () => {
  let component: BusListBottomComponent;
  let fixture: ComponentFixture<BusListBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusListBottomComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusListBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
