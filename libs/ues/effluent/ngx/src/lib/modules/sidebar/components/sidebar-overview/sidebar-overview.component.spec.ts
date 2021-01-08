import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UESEffluentCoreModule } from '../../../core/core.module';

import { SidebarOverviewComponent } from './sidebar-overview.component';

describe('SidebarOverviewComponent', () => {
  let component: SidebarOverviewComponent;
  let fixture: ComponentFixture<SidebarOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UESEffluentCoreModule],
      declarations: [SidebarOverviewComponent]
    }).compileComponents();
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
