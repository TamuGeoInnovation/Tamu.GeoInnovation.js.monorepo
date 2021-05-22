import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusOverviewListComponent } from './campus-overview-list.component';

describe('CampusOverviewListComponent', () => {
  let component: CampusOverviewListComponent;
  let fixture: ComponentFixture<CampusOverviewListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampusOverviewListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampusOverviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
