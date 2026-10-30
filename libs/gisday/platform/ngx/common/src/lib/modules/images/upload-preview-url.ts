import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';

/**
 * What an image upload previews (#2569): the file just chosen, else the picture already saved, else nothing. It
 * starts at nothing, so a form that is adding a record previews nothing rather than waiting for a saved picture that
 * will never come, and Undo (the file control set back to `null`) returns to the saved picture.
 *
 * Draw the result with `tamu-gisc-image-preview`, which shows its fallback for nothing and for a picture that fails
 * to load.
 */
export function uploadPreviewUrl(
  saved$: Observable<string | SafeUrl | null | undefined>,
  file$: Observable<File | null | undefined>,
  sanitizer: DomSanitizer
): Observable<string | SafeUrl | null> {
  return combineLatest([saved$.pipe(startWith(null)), file$.pipe(startWith(null), distinctUntilChanged())]).pipe(
    map(([saved, file]) => (file ? sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)) : (saved ?? null)))
  );
}
