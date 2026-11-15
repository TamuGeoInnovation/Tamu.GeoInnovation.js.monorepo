import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

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
