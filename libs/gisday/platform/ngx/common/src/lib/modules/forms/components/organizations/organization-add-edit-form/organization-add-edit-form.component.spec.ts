import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AssetsService, OrganizationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { OrganizationAddEditFormComponent } from './organization-add-edit-form.component';

describe('OrganizationAddEditFormComponent', () => {
  async function openForImage(): Promise<ComponentFixture<OrganizationAddEditFormComponent>> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'org-1' }) } },
        { provide: OrganizationService, useValue: { getEntity: () => of({ guid: 'org-1', name: 'Organization' }) } },
        { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast: () => undefined } }
      ]
    });

    const fixture = TestBed.createComponent(OrganizationAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

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
