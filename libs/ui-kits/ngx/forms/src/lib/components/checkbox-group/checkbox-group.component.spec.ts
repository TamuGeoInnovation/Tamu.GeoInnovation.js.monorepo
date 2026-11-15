import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CheckboxComponent } from '../checkbox/checkbox.component';
import { CheckboxGroupComponent } from './checkbox-group.component';

describe('CheckboxGroupComponent', () => {
  let component: CheckboxGroupComponent;
  let fixture: ComponentFixture<CheckboxGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxGroupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupComponent);
    component = fixture.componentInstance;

    // Provide @Input properties
    fixture.componentRef.setInput('referenceId', 'name');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate ngOnInit', () => {
    fixture.componentRef.setInput('referenceId', undefined);
    expect(() => {
      component.ngOnInit();
    }).toThrow();
  });

  it('should correctly evaluate writeValue', () => {
    component.writeValue(['reeee', 'reeee']);
    expect(component.value).toStrictEqual(['reeee', 'reeee']);
  });
});

/**
 * #2887. The admin event form opened an event with its tags all unticked, though the form held them, so an organizer who
 * ticked one again took it off. The group ticked its checkboxes once, when its content query first listed them, before
 * their `[data]` inputs were bound, and never again. The host here does what the form does: the value is written, then
 * the checkboxes arrive from a loop.
 */
describe('CheckboxGroupComponent in a form', () => {
  @Component({
    imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
    template: `
      <tamu-gisc-checkbox-group referenceId="guid" [formControl]="control">
        @for (tag of tags(); track tag.guid) {
          <tamu-gisc-checkbox [data]="tag" [label]="tag.name"></tamu-gisc-checkbox>
        }
      </tamu-gisc-checkbox-group>
    `
  })
  class HostComponent {
    public readonly control = new FormControl<Array<string>>([]);
    public readonly tags = signal<Array<{ guid: string; name: string }>>([]);
  }

  const tags = [
    { guid: 'career', name: 'Career' },
    { guid: 'lunch', name: 'Lunch' },
    { guid: 'social', name: 'Social' }
  ];

  async function settle(fixture: ComponentFixture<HostComponent>) {
    fixture.detectChanges();
    await fixture.whenStable();
    // The group used to tick its checkboxes in a timeout.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  function ticked(fixture: ComponentFixture<HostComponent>) {
    return fixture.debugElement
      .queryAll(By.directive(CheckboxComponent))
      .filter((d) => (d.componentInstance as CheckboxComponent).checked)
      .map((d) => (d.componentInstance as CheckboxComponent).label());
  }

  function click(fixture: ComponentFixture<HostComponent>, label: string) {
    const checkbox = fixture.debugElement
      .queryAll(By.directive(CheckboxComponent))
      .find((d) => (d.componentInstance as CheckboxComponent).label() === label);

    (checkbox.componentInstance as CheckboxComponent).handleMouseEvent();
  }

  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    await settle(fixture);
  });

  it('ticks the saved tags when the value is written before the checkboxes arrive', async () => {
    fixture.componentInstance.control.setValue(['lunch']);
    await settle(fixture);

    fixture.componentInstance.tags.set(tags);
    await settle(fixture);

    expect(ticked(fixture)).toEqual(['Lunch']);
  });

  it('keeps a saved tag when another is ticked, and removes it only when it is unticked', async () => {
    fixture.componentInstance.control.setValue(['lunch']);
    fixture.componentInstance.tags.set(tags);
    await settle(fixture);

    click(fixture, 'Social');
    await settle(fixture);

    expect(fixture.componentInstance.control.value).toEqual(['lunch', 'social']);
    expect(ticked(fixture)).toEqual(['Lunch', 'Social']);

    click(fixture, 'Lunch');
    await settle(fixture);

    expect(fixture.componentInstance.control.value).toEqual(['social']);
    expect(ticked(fixture)).toEqual(['Social']);
  });

  it('unticks a checkbox whose value is taken out by the form', async () => {
    fixture.componentInstance.tags.set(tags);
    fixture.componentInstance.control.setValue(['career', 'lunch']);
    await settle(fixture);

    expect(ticked(fixture)).toEqual(['Career', 'Lunch']);

    fixture.componentInstance.control.setValue(['lunch']);
    await settle(fixture);

    expect(ticked(fixture)).toEqual(['Lunch']);
  });
});
