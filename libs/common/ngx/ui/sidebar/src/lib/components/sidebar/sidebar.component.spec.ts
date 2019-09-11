import { inject } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  it('should create', () => {
    inject([SidebarComponent], (sidebarComponent: SidebarComponent) => {
      expect(sidebarComponent).toBeTruthy();
    });
  });
});
