import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockupComponent } from './lockup.component';

describe('LockupComponent', () => {
  let component: LockupComponent;
  let fixture: ComponentFixture<LockupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
