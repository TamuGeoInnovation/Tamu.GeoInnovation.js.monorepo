import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TentZonePopupComponent } from './tent-zone.component';

describe('TentZonePopupComponent', () => {
  let component: TentZonePopupComponent;
  let fixture: ComponentFixture<TentZonePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TentZonePopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TentZonePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
