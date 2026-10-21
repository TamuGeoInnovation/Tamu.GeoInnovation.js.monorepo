import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

import { AdminComponent } from './admin.component';

@Component({ template: '' })
class EmptyPageComponent {}

/**
 * #1998. On a phone the admin menu sat above every admin page, so the page itself started about a
 * screen down. It now opens from one button, and closes again when a page is chosen.
 */
describe('AdminComponent', () => {
  function open(isMobile: boolean) {
    TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideRouter([{ path: 'admin/seasons', component: EmptyPageComponent }]),
        { provide: GISDAY_SITE, useValue: gisdaySite('') },
        { provide: ResponsiveService, useValue: { isMobile: new BehaviorSubject(isMobile) } }
      ]
    });

    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    return fixture;
  }

  const menu = (root: HTMLElement) => root.querySelector('ul.sidebar') as HTMLElement;
  const toggle = (root: HTMLElement) => root.querySelector('.admin-menu-toggle') as HTMLButtonElement | null;

  it('shows the menu and no button on a wider screen', () => {
    const root = open(false).nativeElement as HTMLElement;

    expect(toggle(root)).toBeNull();
    expect(menu(root).hidden).toBe(false);
  });

  it('hides the menu behind a button on a phone, and the button opens it', () => {
    const fixture = open(true);
    const root = fixture.nativeElement as HTMLElement;

    expect(menu(root).hidden).toBe(true);

    toggle(root)?.click();
    fixture.detectChanges();

    expect(menu(root).hidden).toBe(false);
    expect(toggle(root)?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the menu again once a page is chosen', async () => {
    const fixture = open(true);
    const root = fixture.nativeElement as HTMLElement;

    toggle(root)?.click();
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/admin/seasons');
    fixture.detectChanges();

    expect(menu(root).hidden).toBe(true);
  });
});
