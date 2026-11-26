import { NO_ERRORS_SCHEMA, Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { POPUP_SHARE_URL } from '../../popup-share-url';
import { MarkdownPopupComponent } from './markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../markdown-w-directions-popup/markdown-w-directions-popup.component';

/**
 * The one markdown pair AggieMap and the event maps share (#3486). Each case is a difference the two copies used to
 * have, held to the behaviour chosen for both.
 */
function render<T extends MarkdownPopupComponent>(
  component: Type<T>,
  attributes: Record<string, unknown>,
  extraProviders: Provider[] = []
) {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: ActivatedRoute, useValue: {} },
      { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
      { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
      { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
      { provide: SearchService, useValue: { getSource: vi.fn() } },
      ...extraProviders
    ],
    schemas: [NO_ERRORS_SCHEMA]
  });

  const fixture = TestBed.createComponent(component);
  fixture.componentInstance.data = { attributes, layer: { title: 'Layer title' } } as unknown as __esri.Graphic;
  fixture.detectChanges();

  const element: HTMLElement = fixture.nativeElement;
  return {
    component: fixture.componentInstance,
    title: element.querySelector('.feature-style-1')?.textContent?.trim(),
    paragraphs: Array.from(element.querySelectorAll('p')).map((p) => p.textContent?.trim()),
    // The popup's own copy field, not the one inside the footer.
    copyField: element.querySelector(':scope > .popup-section > tamu-gisc-copy-field'),
    footer: element.querySelector('tamu-gisc-popup-footer')
  };
}

describe('the markdown popups (#3486)', () => {
  for (const component of [MarkdownPopupComponent, MarkdownWDirectionsPopupComponent]) {
    describe(component.name, () => {
      it("takes its title from `name`, as every copy but AggieMap's with-directions one did", () => {
        expect(render(component, { name: 'Rudder Plaza', title: 'Not this' }).title).toBe('Rudder Plaza');
      });

      it("falls back to the layer's title when the feature has no `name`", () => {
        expect(render(component, {}).title).toBe('Layer title');
      });

      it('shows the description, and nothing for a blank one', () => {
        expect(render(component, { description: 'Open 8 to 5' }).paragraphs).toEqual(['Open 8 to 5']);
        TestBed.resetTestingModule();
        expect(render(component, { description: '   ' }).paragraphs).toEqual([]);
      });

      it("no longer shows `Notes`, which no layer behind AggieMap's copy had", () => {
        expect(render(component, { description: 'Open', Notes: 'A note' }).paragraphs).toEqual(['Open']);
      });

      it('makes no copy link of its own on AggieMap, where nothing provides one', () => {
        expect(render(component, { name: 'x', OBJECTID: 7 }).component.shareUrl).toBeNull();
      });

      it('uses the copy link the application provides, as the event maps do', () => {
        const shareUrl = vi.fn().mockReturnValue('https://example.test/football/map?feature=lots:7');
        const rendered = render(component, { name: 'x', OBJECTID: 7 }, [{ provide: POPUP_SHARE_URL, useValue: shareUrl }]);

        expect(rendered.component.shareUrl).toBe('https://example.test/football/map?feature=lots:7');
        expect(shareUrl).toHaveBeenCalledWith(rendered.component.data);
      });
    });
  }

  it('the plain popup shows the copy link in a copy field, and only when there is one', () => {
    expect(render(MarkdownPopupComponent, { name: 'x' }).copyField).toBeNull();
    TestBed.resetTestingModule();
    expect(
      render(MarkdownPopupComponent, { name: 'x' }, [{ provide: POPUP_SHARE_URL, useValue: () => 'https://a.test/' }])
        .copyField
    ).not.toBeNull();
  });

  it('the with-directions popup ends with the shared footer, and no separate copy field', () => {
    const rendered = render(MarkdownWDirectionsPopupComponent, { name: 'x' }, [
      { provide: POPUP_SHARE_URL, useValue: () => 'https://a.test/' }
    ]);

    expect(rendered.footer).not.toBeNull();
    expect(rendered.copyField).toBeNull();
  });
});
