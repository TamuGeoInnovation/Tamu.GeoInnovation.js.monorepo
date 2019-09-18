import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { BusTimetableComponent } from './bus-timetable.component';

describe('BusTimetableComponent', () => {
  it('should create', () => {
    inject([BusTimetableComponent], (component: BusTimetableComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
