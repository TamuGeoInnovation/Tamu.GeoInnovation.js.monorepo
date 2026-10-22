import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { SiteCopyFile, SiteCopyPlan } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SiteCopyService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { SiteCopyComponent } from './site-copy.component';

const file = { format: 'gisday-site-copy', version: 1, source: 'https://txgisday.org', exportedAt: '2026-10-22T15:11:00Z', year: 2026, records: {} } as SiteCopyFile;

const plan = (applied: boolean): SiteCopyPlan => ({
  applied,
  blockers: [],
  warnings: [],
  kinds: [{ kind: 'events', added: ['Keynote'], updated: [], unchanged: 0 }],
  files: { missing: 71, written: applied ? 71 : 0, failed: [] }
});

/**
 * Regression coverage (#2090). The first real import, into gisday.ucgis.org, took a long time after Apply
 * with nothing on screen changing, so it looked as if the click had not registered. While an import runs,
 * the button says so and cannot be clicked again, and a line says what is happening.
 */
describe('SiteCopyComponent', () => {
  it('shows "Applying…", disabled, with what it is doing, until the import answers', async () => {
    const applied = new Subject<SiteCopyPlan>();
    const copy = { import: jest.fn((_: SiteCopyFile, apply: boolean) => (apply ? applied : of(plan(false)))) };

    TestBed.configureTestingModule({
      imports: [SiteCopyComponent],
      providers: [
        { provide: SiteCopyService, useValue: copy },
        { provide: SeasonService, useValue: { seasons$: of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(SiteCopyComponent);
    const page = fixture.nativeElement as HTMLElement;
    const applyButton = () => page.querySelector('tamu-gisc-button.apply input') as HTMLInputElement;

    // A chosen file, as the browser gives it; jsdom's File has no text().
    await fixture.componentInstance.choose({ name: 'gisday-2026.json', text: async () => JSON.stringify(file) } as unknown as File);
    fixture.detectChanges();

    expect(applyButton().value).toBe('Apply');
    expect(applyButton().disabled).toBe(false);

    const running = fixture.componentInstance.apply();
    fixture.detectChanges();

    expect(applyButton().value).toBe('Applying…');
    expect(applyButton().disabled).toBe(true);
    expect(page.textContent).toContain('copying 71 logos and photos from https://txgisday.org');

    applied.next(plan(true));
    applied.complete();
    await running;
    fixture.detectChanges();

    expect(page.textContent).toContain('Imported.');
    expect(page.querySelector('tamu-gisc-button.apply')).toBeNull();
  });
});
