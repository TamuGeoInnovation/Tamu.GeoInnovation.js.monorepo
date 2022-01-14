import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggiemapNgxUiMobileComponent } from './aggiemap-ngx-ui-mobile.component';

describe('AggiemapNgxUiMobileComponent', () => {
  let component: AggiemapNgxUiMobileComponent;
  let fixture: ComponentFixture<AggiemapNgxUiMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggiemapNgxUiMobileComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiemapNgxUiMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
