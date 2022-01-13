import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggiemapSidebarComponent } from './sidebar.component';

describe('AggiemapSidebarComponent', () => {
  let component: AggiemapSidebarComponent;
  let fixture: ComponentFixture<AggiemapSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggiemapSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiemapSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
