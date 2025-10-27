import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggieMapComponent } from './aggie-map.component';

describe('AggieMapComponent', () => {
  let component: AggieMapComponent;
  let fixture: ComponentFixture<AggieMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AggieMapComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AggieMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
