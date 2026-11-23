import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

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

/**
 * #3104: a speaker email lists its speakers, each with a tick box, all ticked to start. With more than one ticked, it
 * offers one email to all of them together, the default, or a copy each; together, every address is on To and the
 * greeting names them all.
 */
describe('ReviewEmailModalComponent, choosing speakers', () => {
  // Given out of order; the window lists them by last name (#3142): Example, Sample, Test.
  const recipients = [
    { guid: 'sp-ca', name: 'Cara Test', firstName: 'Cara', email: 'cara@example.com' },
    { guid: 'sp-sh', name: 'Sharmin Example', firstName: 'Sharmin', email: 'sharmin@example.com' },
    { guid: 'sp-co', name: 'Colby Sample', firstName: 'Colby', email: 'colby@example.com' }
  ];

  function open(kind: string, extra: object = {}) {
    const close = jest.fn();

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
                  kind,
                  label: 'Session details',
                  count: 3,
                  subject: 'Your {site} session',
                  template: 'Howdy {first name},\n\nSee you.',
                  example: {
                    title: 'Sharmin Example',
                    to: 'sharmin@example.com',
                    cc: '',
                    values: { '{first name}': 'Sharmin', '{site}': 'TxGIS Day' }
                  }
                }
              ],
              recipients,
              ...extra
            })
          }
        },
        { provide: ModalRefService, useValue: { close } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const text = (selector: string) => page.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim();
    const toLine = () =>
      [...page.querySelectorAll('.review-email__meta')]
        .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
        .find((t) => t.startsWith('To:'));
    const button = () =>
      [...page.querySelectorAll('tamu-gisc-button input')].map((b) => (b as HTMLInputElement).value).pop();
    const tick = (guids: Array<string>) => {
      fixture.componentInstance.chosen.setValue(guids);
      fixture.detectChanges();
    };

    return { fixture, close, page, text, toLine, button, tick };
  }

  it('lists each speaker by last name, with their address and a tick box, all ticked to start', () => {
    const { fixture, page } = open('session-details');
    const boxes = [...page.querySelectorAll('.review-email__recipients tamu-gisc-checkbox-group tamu-gisc-checkbox')];

    expect(
      boxes.map((b) => [
        b.querySelector('label').textContent.trim(),
        b.querySelector('.description').textContent.trim(),
        b.querySelector('.icon-container').textContent.trim()
      ])
    ).toEqual([
      ['Sharmin Example', 'sharmin@example.com', 'check_box'],
      ['Colby Sample', 'colby@example.com', 'check_box'],
      ['Cara Test', 'cara@example.com', 'check_box']
    ]);
    expect(fixture.componentInstance.chosen.value).toEqual(['sp-sh', 'sp-co', 'sp-ca']);
  });

  it('sends them one email together by default, every address on To and the greeting naming them all', () => {
    const { fixture, page, text, toLine, button, close } = open('session-details');

    expect(page.querySelector('.review-email__recipients tamu-gisc-radio-group')).not.toBeNull();
    expect(fixture.componentInstance.how.value).toBe('together');
    expect(toLine()).toBe('To: sharmin@example.com, colby@example.com, cara@example.com');
    expect(text('.review-email__preview')).toBe('Howdy Sharmin, Colby and Cara, See you.');
    expect(button()).toBe('Send 1 email');

    fixture.componentInstance.send();

    expect(close).toHaveBeenCalledWith({
      'session-details': 'Howdy {first name},\n\nSee you.',
      'session-details:subject': 'Your {site} session',
      ':recipients': 'sp-sh,sp-co,sp-ca',
      ':together': 'true'
    });
  });

  it('names two as "A and B", and sends nothing to a speaker unticked', () => {
    const { fixture, text, toLine, close, tick } = open('session-details');

    tick(['sp-sh', 'sp-co']);

    expect(toLine()).toBe('To: sharmin@example.com, colby@example.com');
    expect(text('.review-email__preview')).toBe('Howdy Sharmin and Colby, See you.');

    fixture.componentInstance.send();

    expect(close.mock.calls[0][0][':recipients']).toBe('sp-sh,sp-co');
  });

  it('sends a copy each when chosen, as the first ticked gets it, and says how many', () => {
    const { fixture, text, toLine, button, close, tick } = open('session-details');

    tick(['sp-co', 'sp-ca']);
    fixture.componentInstance.how.setValue('each');
    fixture.detectChanges();

    expect(toLine()).toBe('To: colby@example.com');
    expect(text('.review-email__preview')).toBe('Howdy Colby, See you.');
    expect(button()).toBe('Send 2 emails');

    fixture.componentInstance.send();

    expect(close.mock.calls[0][0]).toEqual({
      'session-details': 'Howdy {first name},\n\nSee you.',
      'session-details:subject': 'Your {site} session',
      ':recipients': 'sp-co,sp-ca'
    });
  });

  it('offers no choice with one ticked, and sends that one their own copy', () => {
    const { fixture, page, text, close, tick } = open('session-details');

    tick(['sp-ca']);

    expect(page.querySelector('.review-email__recipients tamu-gisc-radio-group')).toBeNull();
    expect(text('.review-email__preview')).toBe('Howdy Cara, See you.');

    fixture.componentInstance.send();

    expect(close.mock.calls[0][0][':together']).toBeUndefined();
    expect(close.mock.calls[0][0][':recipients']).toBe('sp-ca');
  });

  // #3142: one box ticks every speaker, and with all ticked, unticks every one.
  it('offers Select all, which ticks everyone, and with everyone ticked unticks them all', () => {
    const { fixture, page, tick } = open('session-details');
    const selectAll = () => page.querySelector('.review-email__select-all tamu-gisc-checkbox');
    const mark = () => selectAll().querySelector('.icon-container').textContent.trim();
    const click = () => {
      (selectAll().querySelector('input[type="checkbox"]') as HTMLInputElement).click();
      fixture.detectChanges();
    };

    expect(selectAll().querySelector('label').textContent.trim()).toBe('Select all');
    // All ticked to start, so it shows ticked; clicking it unticks everyone.
    expect(mark()).toBe('check_box');
    click();
    expect(fixture.componentInstance.chosen.value).toEqual([]);
    expect(mark()).toBe('check_box_outline_blank');

    // From none, it ticks everyone, in the order listed.
    click();
    expect(fixture.componentInstance.chosen.value).toEqual(['sp-sh', 'sp-co', 'sp-ca']);

    // From some, it ticks everyone too.
    tick(['sp-co']);
    expect(mark()).toBe('check_box_outline_blank');
    click();
    expect(fixture.componentInstance.chosen.value).toEqual(['sp-sh', 'sp-co', 'sp-ca']);
    expect(mark()).toBe('check_box');
  });

  it('sends nothing with no one ticked, and says so', () => {
    const { fixture, page, close, tick } = open('session-details');

    tick([]);
    fixture.componentInstance.send();

    expect(close).not.toHaveBeenCalled();
    expect(page.textContent).toContain('Tick at least one speaker to send it.');
  });

  it('offers only a copy each when the email cannot go together, and says why', () => {
    const reason = 'Each speaker gets their own copy: it carries their own link to edit their profile.';
    const { fixture, page, toLine, button, close } = open('profile', { copyEachReason: reason });

    // The speakers' own boxes, not Select all (#3142).
    expect(page.querySelectorAll('.review-email__recipients tamu-gisc-checkbox-group tamu-gisc-checkbox').length).toBe(3);
    expect(page.querySelector('.review-email__recipients tamu-gisc-radio-group')).toBeNull();
    expect(page.textContent).toContain(reason);
    expect(toLine()).toBe('To: sharmin@example.com');
    expect(button()).toBe('Send 3 emails');

    fixture.componentInstance.how.setValue('together');
    fixture.componentInstance.send();

    expect(close.mock.calls[0][0][':together']).toBeUndefined();
    expect(close.mock.calls[0][0][':recipients']).toBe('sp-sh,sp-co,sp-ca');
  });

  it('lists no speakers, and closes with the texts alone, for an email that does not list them', () => {
    const { fixture, page, close } = open('session-details', { recipients: undefined });

    expect(page.querySelector('.review-email__recipients')).toBeNull();

    fixture.componentInstance.send();

    expect(close).toHaveBeenCalledWith({
      'session-details': 'Howdy {first name},\n\nSee you.',
      'session-details:subject': 'Your {site} session'
    });
  });
});

/** #3167: the maintainer could not tell who was already sent an email. Made-up speakers only. */
describe('ReviewEmailModalComponent, who was sent it before', () => {
  const recipients = [
    {
      guid: 'sp-ca',
      name: 'Cara Test',
      firstName: 'Cara',
      email: 'cara@example.com',
      sends: { thisEmail: [], others: [{ kind: 'profile', at: '2026-11-15T20:10:00.000Z' }] }
    },
    {
      guid: 'sp-sh',
      name: 'Sharmin Example',
      firstName: 'Sharmin',
      email: 'sharmin@example.com',
      // 4:05 PM Central, 16 November 2026.
      sends: { thisEmail: ['2026-11-16T22:05:00.000Z'], others: [] }
    },
    { guid: 'sp-co', name: 'Colby Sample', firstName: 'Colby', email: 'colby@example.com', sends: { thisEmail: [], others: [] } }
  ];

  function open() {
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
                  count: 3,
                  subject: 'Your session',
                  template: 'Howdy {first name}',
                  example: { title: 'Sharmin Example', to: 'sharmin@example.com', cc: '', values: { '{first name}': 'Sharmin' } }
                }
              ],
              recipients
            })
          }
        },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const rows = () =>
      [...page.querySelectorAll('.review-email__recipients tamu-gisc-checkbox-group tamu-gisc-checkbox')].map((b) => [
        b.querySelector('label').textContent.trim(),
        b.querySelector('.description').textContent.trim()
      ]);

    return { fixture, page, rows };
  }

  it("says under each speaker whether and when they were sent it, and how many were not", () => {
    const { page, rows } = open();

    expect(rows()).toEqual([
      ['Sharmin Example', 'sharmin@example.com · Sent once, last Nov 16, 4:05 PM'],
      ['Colby Sample', 'colby@example.com · Not sent yet'],
      ['Cara Test', 'cara@example.com · Not sent yet']
    ]);
    expect(page.querySelector('.review-email__sent-choices').textContent.replace(/\s+/g, ' ')).toContain(
      '2 of 3 have not been sent this email yet.'
    );
  });

  it('ticks only those not sent it yet', () => {
    const { fixture, page } = open();

    (page.querySelector('.review-email__tick-not-sent input') as HTMLInputElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.chosen.value).toEqual(['sp-co', 'sp-ca']);
  });

  it('lists those not sent it first when asked', () => {
    const { fixture, rows } = open();

    fixture.componentInstance.notSentFirst.setValue(true);
    fixture.detectChanges();

    expect(rows().map(([name]) => name)).toEqual(['Colby Sample', 'Cara Test', 'Sharmin Example']);
  });

  it('lists every email each was sent, with its date', () => {
    const { page } = open();
    const items = [...page.querySelectorAll('.review-email__history li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());

    expect(items).toEqual([
      'Sharmin Example: Nov 16, 4:05 PM: this email',
      'Colby Sample: nothing yet',
      'Cara Test: Nov 15, 2:10 PM: the presenter profile email'
    ]);
  });
});

/**
 * #3189: a preview the API refuses (a 4xx) says why, in the API's own words, as the other admin pages do since #2966. It
 * is one window for every email, so this covers them all. A 5xx or no answer keeps the generic line.
 */
describe('ReviewEmailModalComponent, a preview that fails', () => {
  function open(error: HttpErrorResponse) {
    TestBed.configureTestingModule({
      imports: [ReviewEmailModalComponent],
      providers: [
        { provide: MODAL_DATA, useValue: { verb: 'Send profile email', preview: throwError(() => error) } },
        { provide: ModalRefService, useValue: { close: jest.fn() } },
        NO_SENDERS
      ]
    });

    const fixture = TestBed.createComponent(ReviewEmailModalComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it('shows the reason a 4xx gives', () => {
    const page = open(
      new HttpErrorResponse({
        status: 400,
        error: { statusCode: 400, message: 'This session has no speakers to email', error: 'Bad Request' }
      })
    );

    expect(page).toContain('The email could not be loaded, so nothing was sent.');
    expect(page).toContain('This session has no speakers to email');
    expect(page).not.toContain('Please try again');
  });

  it('keeps the generic line for a 500', () => {
    const page = open(
      new HttpErrorResponse({
        status: 500,
        error: { statusCode: 500, message: 'Internal server error' }
      })
    );

    expect(page).toContain('The email could not be loaded, so nothing was sent. Please try again.');
    expect(page).not.toContain('Internal server error');
  });
});
