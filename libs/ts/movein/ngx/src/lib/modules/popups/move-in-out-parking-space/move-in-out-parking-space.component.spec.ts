import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutParkingSpaceComponent } from './move-in-out-parking-space.component';

describe('MoveInOutParkingSpaceComponent', () => {
  let component: MoveInOutParkingSpaceComponent;
  let fixture: ComponentFixture<MoveInOutParkingSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveInOutParkingSpaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutParkingSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
