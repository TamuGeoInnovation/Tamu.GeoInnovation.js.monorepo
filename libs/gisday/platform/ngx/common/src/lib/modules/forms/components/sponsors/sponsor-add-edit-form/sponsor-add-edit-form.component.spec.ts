import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { AssetsService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SponsorAddEditFormComponent } from './sponsor-add-edit-form.component';

describe('SponsorAddEditFormComponent', () => {
  // "Delete Sponsor" was reported to send the DELETE twice for one click (#2205).
  describe('Delete Sponsor', () => {
    function create() {
      const deleteEntity = jest.fn().mockReturnValue(of({}));

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of({ guid: 'sp-1' }) } },
          { provide: SponsorService, useValue: { getEntity: () => of({ guid: 'sp-1', name: 'Sponsor' }), deleteEntity } },
          { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: () => undefined } }
        ]
      });

      const fixture = TestBed.createComponent(SponsorAddEditFormComponent);
      fixture.componentRef.setInput('type', 'edit');
      fixture.detectChanges();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        'tamu-gisc-button[look="danger"] input'
      );

      return { button, deleteEntity };
    }

    it('asks to delete the sponsor once for one click', () => {
      const { button, deleteEntity } = create();

      button.click();

      expect(deleteEntity).toHaveBeenCalledTimes(1);
      expect(deleteEntity).toHaveBeenCalledWith('sp-1');
    });
  });

  /**
   * #2964. Escape on an admin details page asks before leaving only when the form has changes (#2942). A sponsor
   * opened and left as it was has none: its text boxes, check box, drop-downs and file picker take the values the page
   * gives them without reporting them back as changes, with nothing on the page setting the form back afterwards.
   */
  describe('as it opens', () => {
    function open(type: 'create' | 'edit', sponsor: Observable<object>) {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of(type === 'edit' ? { guid: 'sp-1' } : {}) } },
          { provide: SponsorService, useValue: { getEntity: () => sponsor } },
          { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast: () => undefined } }
        ]
      });

      const fixture = TestBed.createComponent(SponsorAddEditFormComponent);
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();

      return fixture;
    }

    const saved = {
      guid: 'sp-1',
      name: 'Sponsor',
      website: 'https://example.com',
      active: false,
      sponsorshipLevel: 'raster',
      logoSize: 'large',
      season: { guid: 'season' }
    };

    it('holds no changes once the sponsor it shows has arrived', () => {
      const sponsor = new Subject<object>();
      const fixture = open('edit', sponsor);

      // After the page has drawn, as an answer from the API arrives.
      sponsor.next(saved);
      sponsor.complete();
      fixture.detectChanges();

      expect(fixture.componentInstance.form.getRawValue()).toEqual(
        expect.objectContaining({ name: 'Sponsor', active: false, sponsorshipLevel: 'raster', logoSize: 'large' })
      );
      expect(fixture.componentInstance.form.dirty).toBe(false);
      expect(fixture.componentInstance.form.touched).toBe(false);
    });

    it('holds no changes when the sponsor arrives before the page has drawn', () => {
      const fixture = open('edit', of(saved));

      expect(fixture.componentInstance.form.getRawValue().name).toBe('Sponsor');
      expect(fixture.componentInstance.form.dirty).toBe(false);
    });

    it('holds no changes as a new, empty sponsor', () => {
      const fixture = open('create', of(null));

      expect(fixture.componentInstance.form.getRawValue().season).toBe('season');
      expect(fixture.componentInstance.form.dirty).toBe(false);
    });

    it('holds a change once a field is typed in', () => {
      const sponsor = new Subject<object>();
      const fixture = open('edit', sponsor);
      sponsor.next(saved);
      fixture.detectChanges();

      const name: HTMLInputElement = fixture.nativeElement.querySelector('tamu-gisc-textbox input');
      name.value = 'Renamed sponsor';
      name.dispatchEvent(new Event('input'));

      expect(fixture.componentInstance.form.getRawValue().name).toBe('Renamed sponsor');
      expect(fixture.componentInstance.form.dirty).toBe(true);
    });
  });

  // A refused logo said only "Error creating sponsor: 400"; the API says why (#2966).
  describe('a refused save', () => {
    const refusal = new HttpErrorResponse({
      status: 400,
      error: { statusCode: 400, message: 'The photo must be a PNG or JPEG image', error: 'Bad Request' }
    });

    function create(type: 'create' | 'edit') {
      const toast = jest.fn();

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of({ guid: 'sp-1' }) } },
          {
            provide: SponsorService,
            useValue: {
              getEntity: () => of({ guid: 'sp-1', name: 'Sponsor' }),
              createEntityFormData: () => throwError(() => refusal),
              updateEntityFormData: () => throwError(() => refusal)
            }
          },
          { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
          { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
          { provide: NotificationService, useValue: { toast } }
        ]
      });

      const fixture = TestBed.createComponent(SponsorAddEditFormComponent);
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();

      return { component: fixture.componentInstance, toast };
    }

    it.each(['create', 'edit'] as const)("shows the API's reason when a sponsor %s is refused", (type) => {
      const { component, toast } = create(type);

      component.handleSubmission();

      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'The photo must be a PNG or JPEG image' }));
    });
  });
});
