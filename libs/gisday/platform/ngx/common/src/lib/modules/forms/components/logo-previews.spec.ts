import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  AssetsService,
  OrganizationService,
  PlaceService,
  SeasonService,
  SponsorService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { OrganizationAddEditFormComponent } from './organizations/organization-add-edit-form/organization-add-edit-form.component';
import { PlaceLocationAddEditFormComponent } from './places/place-location-add-edit-form/place-location-add-edit-form.component';
import { SponsorAddEditFormComponent } from './sponsors/sponsor-add-edit-form/sponsor-add-edit-form.component';

/**
 * #2569. Every form with a logo upload drew `<img [src]="logoUrl$ | async">`, a broken image with the alt text
 * "Logo preview" until a logo was chosen (Admin, Affiliations, Add on 30 October 2026). The venue form was worse: it
 * built its preview only when editing, so adding a venue never previewed the chosen logo at all. And none went back
 * to the saved logo, or to nothing, on Undo. Each now draws the shared image preview.
 */
describe.each([
  { name: 'Affiliations (organizations)', component: OrganizationAddEditFormComponent, icon: 'business' },
  { name: 'Sponsors', component: SponsorAddEditFormComponent, icon: 'business' },
  { name: 'Venues (places)', component: PlaceLocationAddEditFormComponent, icon: 'place' }
] as Array<{ name: string; component: Type<unknown>; icon: string }>)('$name: the logo preview', ({ component, icon }) => {
  function create(type: 'create' | 'edit', savedLogoPath?: string) {
    const entity = { guid: 'e-1', name: 'Entity', logos: savedLogoPath ? [{ guid: 'logo-1', path: savedLogoPath }] : [], links: [] };
    const service = { getEntity: () => of(entity) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: OrganizationService, useValue: service },
        { provide: SponsorService, useValue: service },
        { provide: PlaceService, useValue: service },
        { provide: AssetsService, useValue: { getAssetUrl: (path: string) => of(`assets/uploads/${path}`) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast: () => undefined } }
      ]
    });

    const fixture = TestBed.createComponent(component);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const images = () => Array.from(page.querySelectorAll<HTMLImageElement>('tamu-gisc-image-preview img'));
    const fallback = () => page.querySelector('tamu-gisc-image-preview .material-icons')?.textContent.trim();
    const choose = (file: File | null) => {
      (fixture.componentInstance as { form: { get(n: string): { setValue(v: unknown): void } } }).form
        .get('file')
        .setValue(file);
      fixture.detectChanges();
    };

    return { page, images, fallback, choose, render: () => fixture.detectChanges() };
  }

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:chosen-logo');
  });

  it('draws no broken image, and shows its icon, before a logo is chosen', () => {
    const { page, images, fallback } = create('create');

    expect(Array.from(page.querySelectorAll('img')).filter((img) => !img.getAttribute('src'))).toEqual([]);
    expect(images()).toEqual([]);
    expect(fallback()).toBe(icon);
  });

  it('previews the chosen logo, when adding as well as editing', () => {
    const { images, choose } = create('create');

    choose(new File(['x'], 'logo.png', { type: 'image/png' }));

    expect(images().map((img) => img.getAttribute('src'))).toEqual(['blob:chosen-logo']);
  });

  it('goes back to the icon on Undo', () => {
    const { images, fallback, choose } = create('create');

    choose(new File(['x'], 'logo.png', { type: 'image/png' }));
    choose(null);

    expect(images()).toEqual([]);
    expect(fallback()).toBe(icon);
  });

  it('shows the saved logo when editing, and goes back to it on Undo', () => {
    const { images, choose } = create('edit', 'images/logos/saved.png');

    expect(images().map((img) => img.getAttribute('src'))).toEqual(['assets/uploads/images/logos/saved.png']);

    choose(new File(['x'], 'logo.png', { type: 'image/png' }));
    choose(null);

    expect(images().map((img) => img.getAttribute('src'))).toEqual(['assets/uploads/images/logos/saved.png']);
  });

  it('shows the icon instead of a broken image when the saved logo does not load', () => {
    const { images, fallback, render } = create('edit', 'images/logos/missing.png');

    images()[0].dispatchEvent(new Event('error'));
    render();

    expect(images()).toEqual([]);
    expect(fallback()).toBe(icon);
  });
});
