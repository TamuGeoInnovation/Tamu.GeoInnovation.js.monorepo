import { of } from 'rxjs';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { sendProfileEmail, sendSessionDetailsEmail } from './profile-email';

/** #3100: the profile and session details emails go as the sender chosen in the window's "Send as" box. */
describe('sendEditableEmail, Send as', () => {
  const preview = of({ groups: [] });

  it('sends the subject, the text and the sender chosen', () => {
    const modals = {
      open: () => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile', ':sender': 'jadmin@tamu.edu' })
    } as unknown as ModalService;
    const send = jest.fn((email: object) => of(email));

    sendProfileEmail(modals, preview, send).subscribe();

    expect(send.mock.calls[0][0]).toEqual({ subject: 'Profile', template: 'Hi {edit link}', sender: 'jadmin@tamu.edu' });
  });

  it('sends the session details as the sender chosen too', () => {
    const modals = {
      open: () => of({ 'session-details': 'Hi', 'session-details:subject': 'Your session', ':sender': 'gisday@tamu.edu' })
    } as unknown as ModalService;
    const send = jest.fn((email: object) => of(email));

    sendSessionDetailsEmail(modals, preview, send).subscribe();

    expect(send.mock.calls[0][0]).toEqual({ subject: 'Your session', template: 'Hi', sender: 'gisday@tamu.edu' });
  });

  it('names no sender when the window offered none, so the site sends it as before', () => {
    const modals = {
      open: () => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })
    } as unknown as ModalService;
    const send = jest.fn((email: object) => of(email));

    sendProfileEmail(modals, preview, send).subscribe();

    expect(send.mock.calls[0][0]).toEqual({ subject: 'Profile', template: 'Hi {edit link}' });
  });
});

/** #3104: the speakers ticked in the window, and together, go with the email; the profile email never goes together. */
describe('sendEditableEmail, choosing speakers', () => {
  const preview = of({ groups: [] });

  it('sends the session details to the speakers ticked, together when chosen', () => {
    const modals = {
      open: () =>
        of({
          'session-details': 'Hi',
          'session-details:subject': 'S',
          ':recipients': 'sp-1,sp-2',
          ':together': 'true'
        })
    } as unknown as ModalService;
    const send = jest.fn((email: object) => of(email));

    sendSessionDetailsEmail(modals, preview, send).subscribe();

    expect(send.mock.calls[0][0]).toEqual({ subject: 'S', template: 'Hi', speakers: ['sp-1', 'sp-2'], together: true });
  });

  it('sends the profile email to the speakers ticked, a copy each, even if asked for together', () => {
    const modals = {
      open: () => of({ profile: 'Hi {edit link}', 'profile:subject': 'P', ':recipients': 'sp-2', ':together': 'true' })
    } as unknown as ModalService;
    const send = jest.fn((email: object) => of(email));

    sendProfileEmail(modals, preview, send).subscribe();

    expect(send.mock.calls[0][0]).toEqual({ subject: 'P', template: 'Hi {edit link}', speakers: ['sp-2'] });
  });
});
