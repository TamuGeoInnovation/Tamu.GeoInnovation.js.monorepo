import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarOverviewComponent } from './sidebar-overview.component';

describe('SidebarOverviewComponent', () => {
  let component: SidebarOverviewComponent;
  let fixture: ComponentFixture<SidebarOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
