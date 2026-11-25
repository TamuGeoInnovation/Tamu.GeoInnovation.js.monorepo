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
 * screen down. It now opens from one button, and closes again when a page is chosen. The menu is left
 * out of the page when closed, not given [hidden], which the grid's column styles override: the first
 * version passed a [hidden] check while the menu still showed on a phone.
 */
describe('AdminComponent', () => {
  function open(isMobile: boolean, site = '') {
    TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideRouter([{ path: 'admin/seasons', component: EmptyPageComponent }]),
        { provide: GISDAY_SITE, useValue: gisdaySite(site) },
        { provide: ResponsiveService, useValue: { isMobile: new BehaviorSubject(isMobile) } }
      ]
    });

    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    return fixture;
  }

  const menu = (root: HTMLElement) => root.querySelector('ul.sidebar') as HTMLElement | null;
  const toggle = (root: HTMLElement) => root.querySelector('.admin-menu-toggle') as HTMLButtonElement | null;

  it('shows the menu and no button on a wider screen', () => {
    const root = open(false).nativeElement as HTMLElement;

    expect(toggle(root)).toBeNull();
    expect(menu(root)).not.toBeNull();
  });

  it('hides the menu behind a button on a phone, and the button opens it', () => {
    const fixture = open(true);
    const root = fixture.nativeElement as HTMLElement;

    expect(menu(root)).toBeNull();

    toggle(root)?.click();
    fixture.detectChanges();

    expect(menu(root)).not.toBeNull();
    expect(toggle(root)?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the menu again once a page is chosen', async () => {
    const fixture = open(true);
    const root = fixture.nativeElement as HTMLElement;

    toggle(root)?.click();
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/admin/seasons');
    fixture.detectChanges();

    expect(menu(root)).toBeNull();
  });

  it('opens the menu with Dashboards, and the RSVP, Check-ins, VGI submissions, User accounts and Speaker badges dashboards under it (#2878, #3006, #2894, #2892, #2899)', () => {
    const root = open(false).nativeElement as HTMLElement;
    const first = menu(root)?.querySelector(':scope > li');

    expect(first?.querySelector(':scope > a')?.textContent?.trim()).toBe('dashboard Dashboards');
    expect(first?.querySelector(':scope > a')?.getAttribute('href')).toContain('/dashboards');
    expect(Array.from(first?.querySelectorAll('.sidebar_sublevel a') ?? []).map((a) => a.textContent?.trim())).toEqual(['RSVPs', 'Check-ins', 'VGI submissions', 'User accounts', 'Speaker badges']);
  });

  // #2894: UCGIS's site has no VGI competition, so no VGI submissions dashboard either.
  it('leaves the VGI submissions dashboard out on a site without the competition', () => {
    const root = open(false, 'ucgis').nativeElement as HTMLElement;
    const dashboards = Array.from(root.querySelectorAll('.sidebar_sublevel a')).map((a) => a.textContent?.trim());

    expect(dashboards).toContain('RSVPs');
    expect(dashboards).not.toContain('VGI submissions');
  });

  // #3183: judging the research competitions has its two pages under Research Competitions, where the site runs them,
  // and their winners theirs (#3239).
  it('lists Submissions, Rubrics, Judging results and Winners under Research Competitions', () => {
    const root = open(false).nativeElement as HTMLElement;
    const item = Array.from(menu(root)?.querySelectorAll(':scope > li') ?? []).find((li) =>
      li.querySelector(':scope > a')?.textContent?.includes('Research Competitions')
    );
    const links = Array.from(item?.querySelectorAll('.sidebar_sublevel a') ?? []);

    expect(links.map((a) => a.textContent?.trim())).toEqual(['Submissions', 'Rubrics', 'Judging results', 'Winners']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      expect.stringContaining('/research-competition'),
      expect.stringContaining('/research-competition/rubrics'),
      expect.stringContaining('/research-competition/judging'),
      expect.stringContaining('/research-competition/winners')
    ]);
  });

  it('has no judging pages on a site without the research competitions', () => {
    const root = open(false, 'ucgis').nativeElement as HTMLElement;
    const links = Array.from(root.querySelectorAll('.sidebar_sublevel a')).map((a) => a.textContent?.trim());

    expect(links).not.toContain('Rubrics');
    expect(links).not.toContain('Judging results');
  });
});
