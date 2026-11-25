import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AdminDetailsPage, injectBackToList, provideAdminDetailsPage } from './admin-details-page';

@Component({ selector: 'tamu-gisc-test-form', template: '' })
class FormComponent {
  public readonly leave = injectBackToList('/admin/tags');
}

@Component({
  selector: 'tamu-gisc-test-page',
  template: '<tamu-gisc-test-form />',
  imports: [FormComponent],
  providers: [provideAdminDetailsPage(() => PageComponent)]
})
class PageComponent implements AdminDetailsPage {
  public readonly backToList = vi.fn();
}

/**
 * #2965. A shared admin form leaves, after a save, a create or a delete, through the admin details page it is on, so the
 * list keeps its season and search; a form anywhere else goes to its list, as every form did before.
 */
describe('injectBackToList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('goes back through the page the form is on', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(PageComponent);
    fixture.detectChanges();

    fixture.debugElement.children[0].injector.get(FormComponent).leave();

    expect(fixture.componentInstance.backToList).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes to the list when the form is on no admin details page', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(FormComponent);

    fixture.componentInstance.leave();

    expect(navigate).toHaveBeenCalledWith(['/admin/tags']);
  });
});
