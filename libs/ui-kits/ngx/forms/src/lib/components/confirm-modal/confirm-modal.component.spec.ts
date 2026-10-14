import { TestBed } from '@angular/core/testing';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ConfirmModalComponent, ConfirmModalData } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  const render = (data: ConfirmModalData) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
      providers: [{ provide: MODAL_DATA, useValue: data }]
    });

    const fixture = TestBed.createComponent(ConfirmModalComponent);
    fixture.detectChanges();

    return fixture;
  };

  it('shows the title, the message and both answers', () => {
    const fixture = render({
      title: 'You are outside the check-in zone',
      message: 'You need to be at TAMU Rudder Plaza.',
      confirm: 'Check-in anyway',
      cancel: 'Cancel'
    });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('You are outside the check-in zone');
    expect(text).toContain('You need to be at TAMU Rudder Plaza.');
    expect(fixture.nativeElement.querySelectorAll('tamu-gisc-button').length).toBe(2);
  });

  it('closes with true for the confirm answer and false for cancel', () => {
    const fixture = render({ title: 'T', message: 'M' });
    const close = jest.spyOn(TestBed.inject(ModalRefService), 'close');

    fixture.componentInstance.answer(true);
    fixture.componentInstance.answer(false);

    expect(close).toHaveBeenNthCalledWith(1, true);
    expect(close).toHaveBeenNthCalledWith(2, false);
  });
});
