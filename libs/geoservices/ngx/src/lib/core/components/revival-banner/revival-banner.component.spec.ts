import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevivalBannerComponent } from './revival-banner.component';

describe('RevivalBannerComponent', () => {
  let component: RevivalBannerComponent;
  let fixture: ComponentFixture<RevivalBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevivalBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevivalBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
