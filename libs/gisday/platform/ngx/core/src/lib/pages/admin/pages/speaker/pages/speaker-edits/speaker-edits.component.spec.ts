import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PendingSpeakerEdit, SpeakerEditsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SpeakerEditsComponent } from './speaker-edits.component';

/**
 * #3083: a decision on a speaker's edit that fails says why. On 15 November 2026 it said "Please try again." whatever
 * the server answered: a deadlock, a refusal for want of a permission, or an edit already decided.
 */
describe('SpeakerEditsComponent, a decision that fails', () => {
  const edit = { guid: 'edit-1', speaker: { firstName: 'Ana', lastName: 'Ruiz' } } as unknown as PendingSpeakerEdit;
  let toast: Mock;

  function decideAgainst(answer: object) {
    toast = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SpeakerEditsService,
          useValue: {
            pending: () => of([]),
            approve: () => throwError(() => answer),
            reject: () => throwError(() => answer)
          }
        },
        { provide: NotificationService, useValue: { toast } }
      ]
    });
    // The decision is under test, not the page's template.
    TestBed.overrideTemplate(SpeakerEditsComponent, '');

    const page = TestBed.createComponent(SpeakerEditsComponent).componentInstance;

    page.decide(edit, 'approve');

    return toast.mock.calls[0][0] as { title: string; message: string };
  }

  it("says the server's own reason, such as an edit already decided", () => {
    expect(
      decideAgainst({ status: 404, error: { statusCode: 404, message: 'That edit is not waiting for review.' } })
    ).toEqual(
      expect.objectContaining({ title: 'Could not save the decision', message: 'That edit is not waiting for review.' })
    );
  });

  it('names the permission the account lacks for a 403, and does not suggest trying again', () => {
    const shown = decideAgainst({
      status: 403,
      error: { statusCode: 403, message: 'This needs the update:speakers permission.' }
    });

    expect(shown.message).toContain('update:speakers');
    expect(shown.message).not.toContain('try again');
  });

  it('still says to try again when the server failed', () => {
    expect(decideAgainst({ status: 500, error: { statusCode: 500, message: 'Internal server error' } }).message).toBe(
      'Please try again.'
    );
  });
});
