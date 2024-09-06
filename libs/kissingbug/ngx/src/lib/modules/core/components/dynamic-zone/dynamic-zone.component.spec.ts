import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicZoneComponent } from './dynamic-zone.component';

describe('DynamicZoneComponent', () => {
  let component: DynamicZoneComponent;
  let fixture: ComponentFixture<DynamicZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicZoneComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
