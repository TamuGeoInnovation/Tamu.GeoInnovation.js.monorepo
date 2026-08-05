import { TestBed } from '@angular/core/testing';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { EventPassedWarningComponent } from './event-passed-warning.component';

describe('EventPassedWarningComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UIFormsModule],
      declarations: [EventPassedWarningComponent],
      providers: [
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        {
          provide: MODAL_DATA,
          useValue: {
            title: 'This event has passed',
            message: 'Message',
            acknowledgeText: 'I Understand'
          }
        }
      ]
    }).compileComponents();
  });

  it('should render the shared button component', () => {
    const fixture = TestBed.createComponent(EventPassedWarningComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tamu-gisc-button')).toBeTruthy();
  });
});
