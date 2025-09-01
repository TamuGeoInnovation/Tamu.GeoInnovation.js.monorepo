import { Directive, TemplateRef } from '@angular/core';

/**
 * Directive to mark a user-provided template for rendering autocomplete options.
 * Usage:
 * <ng-template tamuGiscAutocompleteOption let-item>
 *   <!-- custom rendering for item -->
 * </ng-template>
 */
@Directive({ selector: '[tamuGiscAutocompleteOption]' })
export class AutocompleteOptionTemplateDirective<T = unknown> {
  constructor(public templateRef: TemplateRef<T>) {}
}
