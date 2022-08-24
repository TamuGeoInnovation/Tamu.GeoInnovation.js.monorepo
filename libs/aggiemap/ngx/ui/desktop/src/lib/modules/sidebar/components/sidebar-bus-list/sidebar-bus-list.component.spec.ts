import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBusListComponent } from './sidebar-bus-list.component';

describe('SidebarBusListComponent', () => {
  let component: SidebarBusListComponent;
  let fixture: ComponentFixture<SidebarBusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarBusListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarBusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
