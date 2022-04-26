import { async, TestBed, inject } from '@angular/core/testing';

import { BasePopupComponent } from './base.component';

describe('BasePopupComponent (isolated)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [BasePopupComponent]
    }).compileComponents();
  }));

  it('should create', inject([BasePopupComponent], (component: BasePopupComponent) => {
    expect(component).toBeTruthy();
  }));
});
