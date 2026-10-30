import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { GalleryComponent } from './gallery.component';

/**
 * The poster gallery listed nothing, because the route it asked for did not exist (#2496). It lists the
 * posters of the season chosen, the active one first, and says so when a season has none.
 */
describe('GalleryComponent', () => {
  const seasons = [
    { guid: 'season-2025', year: 2025 },
    { guid: 'season-2026', year: 2026 }
  ];

  const render = (getPosters: jest.Mock) => {
    TestBed.configureTestingModule({
      imports: [GalleryComponent],
      providers: [
        { provide: UserSubmissionsService, useValue: { getPosters } },
        { provide: SeasonService, useValue: { seasons$: of(seasons), activeSeason$: of(seasons[1]) } }
      ]
    });

    const fixture = TestBed.createComponent(GalleryComponent);

    fixture.detectChanges();

    return { fixture, page: fixture.nativeElement as HTMLElement };
  };

  it("asks for the active season's posters first and lists them with their authors", () => {
    const getPosters = jest.fn().mockReturnValue(
      of([{ title: 'Flood maps', authors: ['A. Aggie', 'B. Bevo'], link: 'https://example.com/flood.pdf', year: 2026 }])
    );
    const { page } = render(getPosters);

    expect(getPosters).toHaveBeenCalledWith(undefined);
    expect(page.querySelector('.poster-submission h2').textContent).toContain('Flood maps');
    expect(page.querySelector('.poster-submission p').textContent).toContain('A. Aggie, B. Bevo');
    expect(page.querySelector('.poster-submission a').getAttribute('href')).toBe('https://example.com/flood.pdf');
    expect(page.textContent).not.toContain('No posters yet.');
  });

  it('says "No posters yet." for a season with none', () => {
    const { page } = render(jest.fn().mockReturnValue(of([])));

    expect(page.querySelectorAll('.poster-submission')).toHaveLength(0);
    expect(page.textContent).toContain('No posters yet.');
  });

  it('asks for the season chosen in the list', () => {
    const getPosters = jest.fn().mockReturnValue(of([]));
    const { fixture } = render(getPosters);

    fixture.componentInstance.setSeason('season-2025');

    expect(getPosters).toHaveBeenLastCalledWith('season-2025');
  });

  it('says so, rather than "No posters yet.", when the posters cannot be loaded', () => {
    const { page } = render(jest.fn().mockReturnValue(throwError(() => new Error('down'))));

    expect(page.textContent).toContain('The posters could not be loaded.');
    expect(page.textContent).not.toContain('No posters yet.');
  });
});
