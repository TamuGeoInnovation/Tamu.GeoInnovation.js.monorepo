import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventListComponent } from './event-list.component';

/**
 * Regression coverage (#2092). An event's "Event active?" decides whether it is on the public schedule, but
 * it could only be changed by opening each event. The admin Events list now shows it and switches it, one
 * event or every selected one, through an endpoint that changes nothing else.
 */
describe('EventListComponent', () => {
  const events = [
    { guid: 'e-on', name: 'Keynote', active: true },
    { guid: 'e-off', name: 'TBD Industry Presentation', active: false }
  ];

  function open(list: Array<object> = events) {
    const service = {
      getEntities: () => of(list),
      getEntitiesForActiveSeason: () => of(list),
      getEntitiesForSeason: () => of(list),
      setActive: jest.fn((guids: Array<string>) => of({ updated: guids.length }))
    };

    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: service },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    return { fixture, service, page: fixture.nativeElement as HTMLElement };
  }

  const activeBoxes = (page: HTMLElement) => [...page.querySelectorAll('td.event-active tamu-gisc-checkbox')];

  // #2943. Each day is headed as the public Sessions page heads it, with its day of the week, in Central time.
  it('heads each day with its day of the week, as the Sessions page does', () => {
    const { page } = open([{ guid: 'e-1', name: 'Workshop', active: true, day: { guid: 'd-1', date: '2026-11-16T06:00:00.000Z' } }]);

    expect(page.querySelector('.card h2').textContent.trim()).toBe('Monday, November 16');
  });

  it('shows whether each event is on the public schedule', () => {
    const { page } = open();
    const boxes = activeBoxes(page);

    expect(boxes).toHaveLength(2);
    // The shared checkbox shows its state as an icon.
    expect(boxes.map((b) => b.querySelector('.icon-container i')?.textContent?.trim())).toEqual(['check_box', 'check_box_outline_blank']);
  });

  it('switches one event from the list, without opening it', async () => {
    const { fixture, service } = open();

    await fixture.componentInstance.setActive(['e-on'], false);

    expect(service.setActive).toHaveBeenCalledWith(['e-on'], false);
  });

  it('switches every selected event at once', async () => {
    const { fixture, service } = open();

    fixture.componentInstance.toggleRow('e-on');
    fixture.componentInstance.toggleRow('e-off');
    await fixture.componentInstance.setSelectedActive(true);

    expect(service.setActive).toHaveBeenCalledWith(['e-on', 'e-off'], true);
  });
});
