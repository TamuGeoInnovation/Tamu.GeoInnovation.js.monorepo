import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TentAreaPopupComponent } from './tent-area.component';

describe('TentAreaPopupComponent', () => {
  let component: TentAreaPopupComponent;
  let fixture: ComponentFixture<TentAreaPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TentAreaPopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TentAreaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
