import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePopupComponent } from './base.component';

describe('BasePopupComponent', () => {
  let component: BasePopupComponent;
  let fixture: ComponentFixture<BasePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BasePopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
