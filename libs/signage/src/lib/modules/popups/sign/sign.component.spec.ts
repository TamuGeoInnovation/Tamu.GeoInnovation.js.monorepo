import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SignPopupComponent } from './sign.component';

describe('SignPopupComponent (isolated)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SignPopupComponent]
    }).compileComponents();
  }));

  it('should create', inject([SignPopupComponent], (component: SignPopupComponent) => {
    expect(component).toBeTruthy();
  }));
});
