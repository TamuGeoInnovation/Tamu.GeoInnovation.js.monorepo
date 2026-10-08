import { TestBed } from '@angular/core/testing';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { EventPassedWarningComponent } from './event-passed-warning.component';

describe('EventPassedWarningComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UIFormsModule, EventPassedWarningComponent],
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

  it('should keep the default follow-up message when none is provided', () => {
    const fixture = TestBed.createComponent(EventPassedWarningComponent);

    expect(fixture.componentInstance.followupMessage).toBe(
      'A new map will be released as we get closer to the next upcoming date for this event.'
    );
  });

  it('should use a provided follow-up message', () => {
    TestBed.overrideProvider(MODAL_DATA, {
      useValue: { followupMessage: 'Tailgate zones are subject to change before next season.' }
    });

    const fixture = TestBed.createComponent(EventPassedWarningComponent);

    expect(fixture.componentInstance.followupMessage).toBe('Tailgate zones are subject to change before next season.');
  });
});
