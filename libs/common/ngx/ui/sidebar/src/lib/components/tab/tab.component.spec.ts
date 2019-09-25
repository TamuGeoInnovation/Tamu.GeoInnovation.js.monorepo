import { SidebarTabComponent } from './tab.component';
import { inject } from '@angular/core/testing';

describe('SidebarTabComponent', () => {
  it('should create', () => {
    inject([SidebarTabComponent], (component: SidebarTabComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
