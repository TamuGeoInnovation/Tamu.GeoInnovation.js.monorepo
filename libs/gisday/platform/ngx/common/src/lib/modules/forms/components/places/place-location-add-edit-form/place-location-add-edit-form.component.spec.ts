import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AssetsService, PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

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

  const openForImage = open;

  /**
   * #3074. The picker reads the shared upload rule (#2937, #3009), as the sponsor form's does: it offers only JPEG and
   * PNG up to 5 MB, and refuses anything else as soon as it is chosen, in the API's words, keeping no file.
   */
  describe('choosing an image', () => {
    // jsdom cannot put a file in a file input, so the picker is given the input's change, as the browser gives it.
    const choose = (fixture: ComponentFixture<{ form: { getRawValue(): { file?: unknown } } }>, file: File) => {
      fixture.debugElement
        .query(By.directive(FileComponent))
        .componentInstance.handleFileChange({ target: { files: [file], value: file.name } });
      fixture.detectChanges();
    };
    const alert = (fixture: ComponentFixture<unknown>) =>
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent?.trim();
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'image.svg', { type: 'image/svg+xml' });

    it("refuses an SVG as soon as it is chosen, in the API's words, and keeps no file", async () => {
      const fixture = await openForImage();

      choose(fixture, svg);

      expect(alert(fixture)).toBe('The logo must be a JPEG or PNG image.');
      expect(fixture.componentInstance.form.getRawValue().file).toBeFalsy();
    });

    it('refuses an image over 5 MB as soon as it is chosen', async () => {
      const fixture = await openForImage();

      choose(fixture, new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }));

      expect(alert(fixture)).toBe('The logo must be 5 MB or smaller.');
      expect(fixture.componentInstance.form.getRawValue().file).toBeFalsy();
    });

    it('takes a PNG, and clears the refusal', async () => {
      const fixture = await openForImage();
      const png = new File(['png'], 'image.png', { type: 'image/png' });

      choose(fixture, svg);
      choose(fixture, png);

      expect(alert(fixture)).toBeUndefined();
      expect(fixture.componentInstance.form.getRawValue().file).toBe(png);
    });
  });
});
