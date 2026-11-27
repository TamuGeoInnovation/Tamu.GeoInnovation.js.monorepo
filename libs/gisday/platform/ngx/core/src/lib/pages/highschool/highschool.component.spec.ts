import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { HighschoolComponent } from './highschool.component';

/**
 * #3889. The High School Portal set its title with `inject(GISDAY_SITE)` in `ngOnInit`, where `inject()` throws (NG0203),
 * so its first render was abandoned and the site's header was left without its logo and menus. The page renders and is
 * titled after the site it is on.
 */
describe('HighschoolComponent', () => {
  it('renders and titles the page after its site, without an error', () => {
    TestBed.configureTestingModule({
      imports: [HighschoolComponent],
      providers: [{ provide: GISDAY_SITE, useValue: gisdaySite('tamu') }]
    });

    const fixture = TestBed.createComponent(HighschoolComponent);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(TestBed.inject(Title).getTitle()).toBe(`High School | ${gisdaySite('tamu').name}`);
  });
});
