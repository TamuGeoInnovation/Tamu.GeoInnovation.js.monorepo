import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OmnitoolbarComponent } from './omnitoolbar.component';

describe('OmnitoolbarComponent', () => {
  let component: OmnitoolbarComponent;
  let fixture: ComponentFixture<OmnitoolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OmnitoolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OmnitoolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
