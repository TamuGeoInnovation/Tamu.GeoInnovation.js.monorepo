import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ReviewEmailModalComponent } from './review-email-modal.component';

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
        { provide: ModalRefService, useValue: { close } }
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
        { provide: ModalRefService, useValue: { close: jest.fn() } }
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
