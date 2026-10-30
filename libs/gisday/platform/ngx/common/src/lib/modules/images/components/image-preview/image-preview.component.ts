import { ChangeDetectionStrategy, Component, computed, effect, input, signal, untracked } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

/**
 * A picture that is never a broken image (#2569). It shows `src` when there is one and it loads; otherwise the
 * `fallback` icon (a Material icon name, for example `person` or `business`), or nothing at all when `fallback` is
 * `null`, which suits a strip of logos where an icon would be out of place.
 *
 * Every image upload preview and every logo uses this, so a missing file (as `images/placeholder.svg` was on
 * production, #2422) or a record with no picture shows the fallback instead of the browser's broken-image box.
 * `showing` says whether the picture itself is on screen, for anything drawn over it (the class banner, #2568).
 */
@Component({
  selector: 'tamu-gisc-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent {
  /** The picture: an address, a `blob:` address of a chosen file, or nothing. */
  public readonly src = input<string | SafeUrl | null | undefined>(undefined);

  /** Read when the picture is shown; the fallback is described by `fallbackLabel`. */
  public readonly alt = input<string>('');

  /** The Material icon shown when there is no picture, or `null` for nothing. */
  public readonly fallback = input<string | null>('image');

  /** Read by a screen reader for the fallback icon. Empty means the icon is decoration. */
  public readonly fallbackLabel = input<string>('');

  private readonly failed = signal(false);

  /** Whether the picture itself is on screen: there is one, and it has not failed to load. */
  public readonly showing = computed(() => !!this.src() && !this.failed());

  constructor() {
    // A new picture gets a fresh chance to load.
    effect(() => {
      this.src();
      untracked(() => this.failed.set(false));
    });
  }

  public onError() {
    this.failed.set(true);
  }
}
