import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SponsorListComponent } from './sponsor-list.component';

/** #1962's switch, with #3627's check: a sponsor with no guid has nothing on the server to switch. */
describe('SponsorListComponent setActive', () => {
  function open() {
    const service = {
      getEntities: () => of([]),
      getEntitiesForActiveSeason: () => of([]),
      getEntitiesForSeason: () => of([]),
      updateEntityFormData: vi.fn(() => of({}))
    };
    const toast = vi.fn();

    TestBed.configureTestingModule({
      imports: [SponsorListComponent],
      providers: [
        provideRouter([]),
        { provide: SponsorService, useValue: service },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast } }
      ]
    });

    const component = TestBed.createComponent(SponsorListComponent).componentInstance;
    component.ngOnInit();

    return { component, service, toast };
  }

  it('switches a sponsor by its guid, and says so', () => {
    const { component, service, toast } = open();

    component.setActive({ guid: 'sp-1', name: 'Esri' }, false);

    expect(service.updateEntityFormData).toHaveBeenCalledWith('sp-1', expect.any(FormData));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Esri is now hidden from the Sponsors page.' }));
  });

  it('sends nothing, and says nothing, for a sponsor with no guid', () => {
    const { component, service, toast } = open();

    component.setActive({ name: 'Esri' }, false);

    expect(service.updateEntityFormData).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });
});
