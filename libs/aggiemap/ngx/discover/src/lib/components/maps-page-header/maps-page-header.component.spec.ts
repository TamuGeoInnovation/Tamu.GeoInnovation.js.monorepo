import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MapsPageHeaderComponent } from './maps-page-header.component';

@Component({ selector: 'tamu-gisc-test-page', template: 'page', changeDetection: ChangeDetectionStrategy.Eager,
 standalone: false })
class TestPageComponent {}

/**
 * The breadcrumb crumbs are fixed destinations, and each is asserted separately because they are
 * rendered by the same markup and styled differently by viewport.
 *
 * This previously asserted that the first crumb pointed at the map the visitor came from. That was
 * wrong and is what #1066 fixed: a crumb labelled "Aggie Map" names a place, so it must lead there.
 * Returning to the previous map is the job of the "< Back" link on All Maps, where it is the only
 * way back; on these pages the parent is All Maps.
 */
describe('MapsPageHeaderComponent', () => {
  let fixture: ComponentFixture<MapsPageHeaderComponent>;

  const crumbHref = (index: number): string | null =>
    fixture.nativeElement.querySelectorAll('.breadcrumbs p a')[index]?.getAttribute('href') ?? null;

  const crumbText = (index: number): string =>
    fixture.nativeElement.querySelectorAll('.breadcrumbs p a')[index]?.textContent.trim() ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'map', component: TestPageComponent },
          { path: 'all-maps', component: TestPageComponent }
        ])
      ],
      declarations: [MapsPageHeaderComponent, TestPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapsPageHeaderComponent);
    fixture.componentInstance.title = 'Campus Events';
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('sends the "Aggie Map" crumb to the main map', () => {
    expect(crumbText(0)).toBe('Aggie Map');
    expect(crumbHref(0)).toBe('/map');
  });

  it('sends the parent crumb to All Maps', () => {
    expect(crumbText(1)).toBe('All Maps');
    expect(crumbHref(1)).toBe('/all-maps');
  });

  /**
   * The phone layout hides every crumb except this one and relabels it "< Back". It is marked by
   * class rather than by position, because position depends on how many crumbs a page has - which is
   * how the wrong element came to be relabelled in the first place.
   */
  it('marks the parent crumb as the one the phone layout turns into a back link', () => {
    const back = fixture.nativeElement.querySelectorAll('.breadcrumbs p.breadcrumb-back');

    expect(back.length).toBe(1);
    expect(back[0].querySelector('a').getAttribute('href')).toBe('/all-maps');
  });

  it('does not depend on where the visitor came from', () => {
    // Nothing on this header reads LastMapService any more; if that changes, the destinations above
    // stop being fixed and this test is the one that should be revisited.
    expect(fixture.nativeElement.querySelectorAll('.breadcrumbs p a').length).toBe(3);
  });
});
