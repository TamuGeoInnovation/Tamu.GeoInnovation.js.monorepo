import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBadRouteComponent } from './report-bad-route.component';

describe('ReportBadRouteComponent', () => {
  let component: ReportBadRouteComponent;
  let fixture: ComponentFixture<ReportBadRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportBadRouteComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBadRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
