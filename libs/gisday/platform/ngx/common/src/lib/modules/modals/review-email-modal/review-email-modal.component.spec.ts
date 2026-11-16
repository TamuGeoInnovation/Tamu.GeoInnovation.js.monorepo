import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ContactService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { gisdaySite } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE } from '../../../site/site';

import { ReviewEmailModalComponent } from './review-email-modal.component';

/** No "Send as" choices (#3100): the window then sends from the site, as before, and closes with the texts alone. */
const NO_SENDERS = { provide: ContactService, useValue: { senders: () => of({ choices: [], unavailable: [] }) } };

/** #3023: the profile email's subject is editable too, and comes back beside the text, as `<kind>:subject`. */
describe('ReviewEmailModalComponent, an editable subject', () => {
  const preview = {
    groups: [
      {
        kind: 'profile',
        label: 'Presenter profile emails',
        count: 2,
        subject: 'Update your {site} presenter profile',
        template: 'Howdy {first name}, {edit link}',
        example: {
          title: 'Ana Ruiz',
          to: 'ana@example.edu',
          cc: '',
          values: { '{first name}': 'Ana', '{site}': 'TxGIS Day', '{edit link}': '(link)' }
        }
      }
    ]
  };

  function open(editableSubject: boolean) {
    const close = jest.fn();

    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        { provide: MODAL_DATA, useValue: { verb: 'Send profile email', editableSubject, preview: of(preview) } },
        { provide: ModalRefService, useValue: { close } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return { fixture, close };
  }

  it('offers the subject as a box of its own, filled in for the example, and sends it back as edited', () => {
    const { fixture, close } = open(true);
    const page = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.exampleSubject('profile', preview.groups[0].example.values)).toBe(
      'Update your TxGIS Day presenter profile'
    );

    fixture.componentInstance.form.controls['profile:subject'].setValue('Your {site} profile');
    fixture.componentInstance.send();

    expect(page.querySelectorAll('tamu-gisc-textbox').length).toBe(2);
    expect(close).toHaveBeenCalledWith({
      profile: 'Howdy {first name}, {edit link}',
      'profile:subject': 'Your {site} profile'
    });
  });

  it('keeps the subject fixed otherwise, as for the acceptance emails', () => {
    const { fixture, close } = open(false);

    fixture.componentInstance.send();

    expect(close).toHaveBeenCalledWith({ profile: 'Howdy {first name}, {edit link}' });
  });
});

/** #3046: who will not be emailed is listed before sending, not only after. */
describe('ReviewEmailModalComponent, people not emailed', () => {
  function open(notEmailed?: Array<{ name: string; submission: string }>) {
    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        {
          provide: MODAL_DATA,
          useValue: {
            verb: 'Send profile email',
            editableSubject: true,
            preview: of({
              groups: [
                {
                  kind: 'profile',
                  label: 'Presenter profile emails',
                  count: 1,
                  subject: 'S',
                  template: 'T {edit link}',
                  example: { title: 'Ana Ruiz', to: 'ana@example.edu', cc: '', values: {} }
                }
              ],
              notEmailed
            })
          }
        },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('names each person on the submissions who has no presenter record, with their submission', () => {
    const page = open([
      { name: 'Ben Lee', submission: 'Flood maps' },
      { name: 'Dee Fox', submission: 'Campus trees' }
    ]);

    expect(page.textContent).toContain('2 people on these submissions will not be emailed');
    expect([...page.querySelectorAll('.review-email__not-emailed li')].map((li) => li.textContent.trim())).toEqual([
      'Ben Lee: Flood maps',
      'Dee Fox: Campus trees'
    ]);
  });

  it('says nothing about it when everyone is emailed', () => {
    expect(open([]).querySelector('.review-email__not-emailed')).toBeNull();
  });
});

/** #3044: the preview shows the Markdown formatted, as it will arrive. */
describe('ReviewEmailModalComponent, Markdown', () => {
  it('shows bold text bold in the preview, and HTML typed into the text as text', () => {
    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        {
          provide: MODAL_DATA,
          useValue: {
            verb: 'Send profile email',
            preview: of({
              groups: [
                {
                  kind: 'profile',
                  label: 'Presenter profile emails',
                  count: 1,
                  subject: 'S',
                  template: 'Hi **{first name}** <b>raw</b>',
                  example: { title: 'Ana Ruiz', to: 'ana@example.edu', cc: '', values: { '{first name}': 'Ana' } }
                }
              ]
            })
          }
        },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.review-email__preview');

    expect(preview.querySelector('strong')?.textContent).toBe('Ana');
    expect(preview.querySelector('b')).toBeNull();
    expect(preview.textContent).toContain('<b>raw</b>');
  });
});

/**
 * #3114: on Texas A&M's site the window shows the whole email as it will arrive, in the GIS Day design, with the season's
 * dates and the sender chosen; elsewhere the plain preview, as before.
 */
describe('ReviewEmailModalComponent, the email design', () => {
  function open(site: string) {
    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        {
          provide: MODAL_DATA,
          useValue: {
            verb: 'Send session details',
            preview: of({
              groups: [
                {
                  kind: 'session-details',
                  label: 'Session details',
                  count: 1,
                  subject: 'Your session',
                  template: 'Hi **{first name}**',
                  example: { title: 'Ana Ruiz', to: 'ana@example.edu', cc: '', values: { '{first name}': 'Ana' } },
                  design: {
                    label: 'Your session',
                    days: ['2026-11-16', '2026-11-20'],
                    session: { name: 'Mapping floods', when: 'Thursday', where: 'MSC 2300' },
                    why: 'You are presenting.'
                  }
                }
              ]
            })
          }
        },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        { provide: GISDAY_SITE, useValue: gisdaySite(site) },
        {
          provide: ContactService,
          useValue: {
            senders: () =>
              of({
                choices: [
                  {
                    kind: 'own',
                    address: 'jadmin@tamu.edu',
                    label: 'Your address',
                    from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>',
                    replyTo: 'jadmin@tamu.edu'
                  }
                ],
                unavailable: []
              })
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it("shows Texas A&M's whole designed email, with the season's dates, the session and the sender chosen", () => {
    const frame = open('tamu').querySelector<HTMLIFrameElement>('iframe.review-email__frame');
    const html = frame?.srcdoc || frame?.getAttribute('srcdoc') || '';

    expect(html).toContain('GIS DAY(S)');
    expect(html).toContain('November 16–20, 2026');
    expect(html).toContain('Mapping floods');
    expect(html).toContain('jadmin@tamu.edu');
    expect(html).toContain('<strong>Ana</strong>');
    // Sandboxed: the email is shown, never run.
    expect(frame.getAttribute('sandbox')).toBe('');
  });

  it("shows txgisday.org's plain email, as before", () => {
    const page = open('txgisday');

    expect(page.querySelector('iframe')).toBeNull();
    expect(page.querySelector('.review-email__preview strong')?.textContent).toBe('Ana');
  });
});

/** #3092: a session's speakers with no email address are named before the session details are sent. */
describe('ReviewEmailModalComponent, speakers with no address', () => {
  function open(noAddress?: Array<string>) {
    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        {
          provide: MODAL_DATA,
          useValue: {
            verb: 'Send session details',
            editableSubject: true,
            preview: of({
              groups: [
                {
                  kind: 'session-details',
                  label: 'Session details',
                  count: 1,
                  subject: 'S',
                  template: 'T',
                  example: { title: 'Ana Ruiz', to: 'ana@example.edu', cc: '', values: {} }
                }
              ],
              noAddress
            })
          }
        },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('names each one, and says why they will not be emailed', () => {
    const page = open(['Dee Fox', 'Eli Ng']);

    expect(page.textContent).toContain('2 people will not be emailed: they have no email address on their record.');
    expect([...page.querySelectorAll('.review-email__not-emailed li')].map((li) => li.textContent.trim())).toEqual([
      'Dee Fox',
      'Eli Ng'
    ]);
  });

  it('says nothing about it when everyone has an address', () => {
    expect(open([]).querySelector('.review-email__not-emailed')).toBeNull();
  });

  it('says nothing about it for an email that does not list them', () => {
    expect(open(undefined).querySelector('.review-email__not-emailed')).toBeNull();
  });
});

/**
 * #3100: a "Send as" box at the top, its choices from the API, the admin's own address first and chosen; the preview shows
 * the From recipients will see, and the window closes with the address chosen beside the texts.
 */
describe('ReviewEmailModalComponent, Send as', () => {
  const choices = [
    {
      kind: 'own',
      address: 'jadmin@tamu.edu',
      label: 'Your address (jadmin@tamu.edu)',
      from: '"Jo Admin (TxGIS Day)" <jadmin@tamu.edu>',
      replyTo: 'jadmin@tamu.edu'
    },
    {
      kind: 'shared',
      address: 'gisday@tamu.edu',
      label: 'Shared address (gisday@tamu.edu)',
      from: '"TxGIS Day" <gisday@tamu.edu>',
      replyTo: 'gisday@tamu.edu'
    }
  ];

  function open(senders: object) {
    const close = jest.fn();

    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        {
          provide: MODAL_DATA,
          useValue: {
            verb: 'Send profile email',
            editableSubject: true,
            preview: of({
              groups: [
                {
                  kind: 'profile',
                  label: 'Presenter profile emails',
                  count: 1,
                  subject: 'S',
                  template: 'T',
                  example: { title: 'Ana Ruiz', to: 'ana@example.edu', cc: '', values: {} }
                }
              ]
            })
          }
        },
        { provide: ModalRefService, useValue: { close } },
        { provide: ContactService, useValue: { senders: () => of(senders) } }
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return { fixture, close, page: fixture.nativeElement as HTMLElement };
  }

  /** The preview's From line, as shown. */
  const fromLine = (page: HTMLElement) =>
    [...page.querySelectorAll('.review-email__meta')]
      .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
      .find((t) => t.startsWith('From:'));

  it('offers the choices in a Send as box, their own chosen, and shows its From and where replies go in the preview', () => {
    const { page } = open({ choices, unavailable: [] });

    expect(page.querySelector('tamu-gisc-select')).not.toBeNull();
    expect(page.textContent).toContain('Send as');
    expect(fromLine(page)).toBe('From: "Jo Admin (TxGIS Day)" <jadmin@tamu.edu> Replies to: jadmin@tamu.edu');
  });

  it('shows the From of another choice, and closes with the address chosen beside the texts', () => {
    const { fixture, close, page } = open({ choices, unavailable: [] });

    fixture.componentInstance.form.controls[':sender'].setValue('gisday@tamu.edu');
    fixture.detectChanges();

    expect(fromLine(page)).toBe('From: "TxGIS Day" <gisday@tamu.edu> Replies to: gisday@tamu.edu');

    fixture.componentInstance.send();

    expect(close).toHaveBeenCalledWith({ profile: 'T', 'profile:subject': 'S', ':sender': 'gisday@tamu.edu' });
  });

  it("says it goes from the site's address, and why their own cannot be used, when there is nothing to choose", () => {
    const { page, fixture, close } = open({
      choices: [],
      unavailable: [
        { address: 'jo@gmail.com', reason: 'Your address is not a tamu.edu address, so emails cannot be sent as it.' }
      ]
    });

    expect(page.querySelector('tamu-gisc-select')).toBeNull();
    expect(page.textContent).toContain("It will be sent from the site's address.");
    expect(page.textContent).toContain('Your address is not a tamu.edu address');
    expect(fromLine(page)).toBe("From: The site's address");

    fixture.componentInstance.send();

    expect(close).toHaveBeenCalledWith({ profile: 'T', 'profile:subject': 'S' });
  });
});
