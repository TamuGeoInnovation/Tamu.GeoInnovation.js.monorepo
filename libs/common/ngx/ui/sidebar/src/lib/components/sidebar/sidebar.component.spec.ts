import { async, inject, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SidebarComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [SidebarComponent], imports: [RouterTestingModule] }).compileComponents();
  }));

  it('should create', inject([SidebarComponent], (sidebarComponent: SidebarComponent) => {
    expect(sidebarComponent).toBeTruthy();
  }));
});
