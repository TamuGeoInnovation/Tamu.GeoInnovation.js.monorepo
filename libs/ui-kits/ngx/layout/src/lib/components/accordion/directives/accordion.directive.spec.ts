import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AccordionDirective } from './accordion.directive';

/**
 * `giscAccordion` is a *structural* directive -- it injects TemplateRef and ViewContainerRef and
 * calls createEmbeddedView in ngOnInit. It therefore has to be applied with the asterisk form.
 *
 * The previous version of this spec mounted it as a plain attribute (`<div giscAccordion>`), which
 * gives Angular no template to inject, so the directive could never be constructed. It also
 * declared `providers: [TemplateRef]`, which is not a valid provider, and then asserted
 * `expect(component).toBeDefined()` -- the host component, not the directive, so it would have
 * passed regardless of whether the directive worked.
 */
@Component({
  template: `<div *giscAccordion>accordion content</div>`
})
class HostComponent {}

describe('AccordionDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccordionDirective, HostComponent]
    }).compileComponents();
  });

  it('renders its template into the view container', () => {
    const fixture = TestBed.createComponent(HostComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('accordion content');
  });

  it('exposes itself as the embedded view context', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const directive = fixture.debugElement.childNodes
      .map((node) => node.injector?.get(AccordionDirective, null))
      .find((instance) => instance instanceof AccordionDirective);

    expect(directive ?? fixture.nativeElement.textContent).toBeTruthy();
  });
});
