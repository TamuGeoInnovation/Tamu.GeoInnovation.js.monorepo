import { signal } from '@angular/core';

import { UPLOAD_IMAGE_RULES, uploadImageProblem } from '@tamu-gisc/gisday/common';

/**
 * One image picker on the shared upload rule (#3009, #3074): the types it offers, and why a chosen file was refused, in
 * the API's words. Every picker of a speaker photo or a sponsor, organization or place logo uses it, so a change to what
 * is allowed changes every picker and the API together.
 *
 * @example
 * public readonly logo = new UploadImagePicker('The logo');
 *
 * <tamu-gisc-file #picker formControlName="file" [accept]="logo.accept" (fileSelected)="logo.choose($event, picker)">
 * @if (logo.problem(); as problem) { <p class="error" role="alert">{{ problem }}</p> }
 */
export class UploadImagePicker {
  /** The types, as the file input's `accept`. */
  public readonly accept = UPLOAD_IMAGE_RULES.accept;

  /** Why the last file chosen was refused, or null. */
  public readonly problem = signal<string | null>(null);

  /** @param label What the image is, for the message: "The logo", "The photo". */
  constructor(private readonly label: string) {}

  /**
   * Refuses a file the API would refuse as soon as it is chosen, rather than previewing it and refusing it on save, and
   * clears the picker so the form keeps the image it had. Returns whether the file may be uploaded.
   *
   * @param picker The file input to clear on a refusal.
   */
  public choose(file: File | undefined, picker?: { reset(): void }): boolean {
    // The picker's own reset reports no file; that is not a choice.
    if (!file) {
      return false;
    }

    const problem = uploadImageProblem(file, this.label);

    this.problem.set(problem);

    if (problem) {
      picker?.reset();
    }

    return problem === null;
  }
}
