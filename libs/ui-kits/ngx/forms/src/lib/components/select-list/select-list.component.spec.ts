import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SelectListComponent } from './select-list.component';

interface Person extends Record<string, unknown> {
  guid: string;
  name: string;
}

@Component({
  template: `
    <tamu-gisc-select-list [options]="people" [rowTemplate]="row" (selected)="chosen = $event"></tamu-gisc-select-list>
    <ng-template #row let-person><span class="person">{{ person.name }}</span></ng-template>
  `,
  imports: [SelectListComponent]
})
class HostComponent {
  public people: Array<Person> = [
    { guid: 'a', name: 'Ana Ruiz' },
    { guid: 'b', name: 'Ben Ode' }
  ];
  public chosen: Person;
}

/**
 * #2871. The GIS Day event form's speaker search: the list shows while focus is inside it, and choosing a speaker
 * left focus there, so the list stayed open over the page after the speaker had been added.
 */
describe('SelectListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('tamu-gisc-select-list');
  });

  function choose(name: string) {
    const search = host.querySelector('input');
    search.focus();
    const row = Array.from(host.querySelectorAll<HTMLElement>('.person')).find((el) => el.textContent === name);
    row.click();
    fixture.detectChanges();
  }

  it('closes its list once an item is chosen, by moving focus out of it', () => {
    choose('Ben Ode');

    expect(host.contains(document.activeElement)).toBe(false);
  });

  it('reports the item chosen, and clears the search for the next one', () => {
    const list: SelectListComponent<Person> = fixture.debugElement.children[0].componentInstance;
    list.form.controls.search.setValue('Ben');

    choose('Ben Ode');

    expect(fixture.componentInstance.chosen).toEqual({ guid: 'b', name: 'Ben Ode' });
    expect(list.form.controls.search.value).toBe('');
  });
});
