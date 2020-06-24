import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockdownMapComponent } from './lockdown-map.component';

describe('LockdownMapComponent', () => {
  let component: LockdownMapComponent;
  let fixture: ComponentFixture<LockdownMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockdownMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
