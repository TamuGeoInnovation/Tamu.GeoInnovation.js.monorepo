import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AssetsService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { PlaceLocationAddEditFormComponent } from './place-location-add-edit-form.component';

/**
 * #3007. Escape on an admin details page asks before leaving only when the form has changes (#2942). A place's link
 * form edited the link it was given in place and never told the place form, so editing only a link left the form
 * unchanged and Escape left without asking, losing the edit. Loading the place must still not count as a change
 * (#2964).
 */
describe('PlaceLocationAddEditFormComponent', () => {
  const saved = {
    guid: 'pl-1',
    name: 'Place',
    links: [{ guid: 'ln-1', label: 'Volunteer', url: 'https://example.com/volunteer' }]
  };

  async function open(): Promise<ComponentFixture<PlaceLocationAddEditFormComponent>> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'pl-1' }) } },
        { provide: PlaceService, useValue: { getEntity: () => of(saved) } },
        { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast: () => undefined } }
      ]
    });

    const fixture = TestBed.createComponent(PlaceLocationAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function linkInputs(fixture: ComponentFixture<PlaceLocationAddEditFormComponent>) {
    return (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('tamu-gisc-place-link-form input');
  }

  it('opens a place with a link unchanged', async () => {
    const fixture = await open();

    expect(linkInputs(fixture)[1].value).toBe('https://example.com/volunteer');
    expect(fixture.componentInstance.form.dirty).toBe(false);
  });

  it("counts editing only a link's address as a change, with the new address in the form", async () => {
    const fixture = await open();
    const url = linkInputs(fixture)[1];

    url.value = 'https://example.com/sponsor';
    url.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.dirty).toBe(true);
    expect(fixture.componentInstance.form.getRawValue().links).toEqual([
      { guid: 'ln-1', label: 'Volunteer', url: 'https://example.com/sponsor' }
    ]);
  });

  it("counts editing only a link's label as a change", async () => {
    const fixture = await open();
    const label = linkInputs(fixture)[0];

    label.value = 'Sponsor';
    label.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.dirty).toBe(true);
    expect(fixture.componentInstance.form.getRawValue().links[0].label).toBe('Sponsor');
  });
});
