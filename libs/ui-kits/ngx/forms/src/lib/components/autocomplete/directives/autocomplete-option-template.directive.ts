import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Directive to mark a user-provided template for rendering autocomplete options.
 * Usage:
 * <ng-template tamuGiscAutocompleteOption let-item>
 *   <!-- custom rendering for item -->
 * </ng-template>
 */
@Directive({ selector: '[tamuGiscAutocompleteOption]' })
export class AutocompleteOptionTemplateDirective<T = unknown> {
  /**
   * Optional input used only for template type inference.
   * Provide the same collection you pass to the autocomplete's `options` input (preferably after `| async`).
   *
   * Example:
   * <ng-template tamuGiscAutocompleteOption
   *              [tamuGiscAutocompleteOptionOf]="filteredEvents | async"
   *              let-item>
   *   {{ item.name }}
   * </ng-template>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Input('tamuGiscAutocompleteOptionOf')
  public set of(_value: ReadonlyArray<T> | null | undefined) {
    // No-op: used purely for Angular template type inference; not read at runtime.
  }

  constructor(public templateRef: TemplateRef<AutocompleteOptionContext<T>>) {}

  /**
   * Informs Angular's template type checker about the context available inside the template.
   * This enables IntelliSense for `let-...` variables.
   */
  public static ngTemplateContextGuard<T>(
    dir: AutocompleteOptionTemplateDirective<T>,
    ctx: unknown
  ): ctx is AutocompleteOptionContext<T> {
    return true;
  }
}

export type AutocompleteOptionContext<T> = { $implicit: T };
