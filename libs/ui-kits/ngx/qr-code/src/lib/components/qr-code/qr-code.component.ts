import { Component, ElementRef, HostBinding, HostListener, computed, inject, input, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { encode } from 'uqr';

import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/**
 * A QR code for `text`, drawn as an SVG so it stays sharp at any size, from a projector to a phone
 * (#2560). With `downloadName` it also offers the code as a PNG, which every slide program accepts.
 * With `fullscreen` it offers to fill the screen with the code, for a presenter sharing their screen.
 * `color` and `logo` brand it: the modules in a colour, and an image in the middle.
 */
@Component({
  selector: 'tamu-gisc-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  imports: [ButtonComponent, NgIf]
})
export class QrCodeComponent {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  /**
   * What the code holds, usually a link.
   */
  public readonly text = input.required<string>();

  /**
   * What the code is for, read out in its place by a screen reader.
   */
  public readonly label = input<string>('QR code');

  /**
   * The downloaded file's name, without `.png`. No download button without it.
   */
  public readonly downloadName = input<string>(undefined);

  /**
   * Whether to offer a Full Screen button. Escape, or the button shown in full screen, leaves it.
   */
  public readonly fullscreen = input<boolean>(false);

  /**
   * A line shown under the code in full screen only, such as what to scan it for.
   */
  public readonly caption = input<string>(undefined);

  /**
   * The modules' colour. Keep it dark: phones read a QR code by the contrast with its white ground.
   */
  public readonly color = input<string>('#000000');

  /**
   * An image for the middle of the code, such as a university's logo, from the same site so a PNG can
   * be drawn with it. The code is made with the highest error correction so it still reads around it.
   */
  public readonly logo = input<string>(undefined);

  /**
   * Whether this code fills the screen now. The browser can leave full screen on its own (Escape), so
   * this follows the document rather than the buttons.
   */
  public readonly isFullscreen = signal(false);

  public readonly modules = computed(() => qrModules(this.text(), this.logo() ? 'H' : 'M'));

  /**
   * Where the logo goes, in modules: a square in the middle left clear of modules. None without a logo.
   */
  public readonly logoBox = computed(() => (this.logo() ? qrLogoBox(this.modules().size) : undefined));

  /**
   * Every dark module outside the logo's square as one SVG path, a 1 x 1 square each, in a box
   * `modules().size` wide.
   */
  public readonly path = computed(() => qrPath(this.modules().data, this.logoBox()));

  /**
   * Full screen is styled by this class rather than `:fullscreen`, so the layout follows the same state
   * the template does.
   */
  @HostBinding('class.is-fullscreen')
  public get fullscreenClass() {
    return this.isFullscreen();
  }

  public async download() {
    const png = await qrPng(this.modules().data, { color: this.color(), logo: this.logo(), logoBox: this.logoBox() });

    if (!png) {
      return;
    }

    const link = document.createElement('a');
    link.href = png;
    link.download = `${this.downloadName()}.png`;
    link.click();
  }

  public enterFullscreen() {
    this.host.nativeElement.requestFullscreen?.()?.catch(() => undefined);
  }

  public exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()?.catch(() => undefined);
    }
  }

  @HostListener('document:fullscreenchange')
  public onFullscreenChange() {
    this.isFullscreen.set(document.fullscreenElement === this.host.nativeElement);
  }
}

/**
 * The code's modules, `true` for dark, with the four-module quiet zone the standard asks for so a
 * phone can find it on a busy slide. Medium error correction by default, so a code that is a little
 * blurred or partly covered still reads; `H` (30%) when a logo covers the middle.
 */
export function qrModules(text: string, ecc: 'M' | 'H' = 'M'): { size: number; data: Array<Array<boolean>> } {
  const { size, data } = encode(text ?? '', { ecc, border: 4 });

  return { size, data };
}

/**
 * The square in the middle of a code `size` modules wide (quiet zone included) left for a logo: an odd
 * number of modules so it sits exactly in the centre, about 30% of the code's width. That clears about
 * 9% of the modules, well inside what `H` error correction recovers.
 */
export function qrLogoBox(size: number): { x: number; y: number; size: number } {
  const code = size - 8;
  let side = Math.round(code * 0.3);

  if (side % 2 === 0) {
    side -= 1;
  }

  const at = (size - side) / 2;

  return { x: at, y: at, size: side };
}

/**
 * An SVG path drawing every dark module as a unit square, leaving `hole` clear.
 */
export function qrPath(data: Array<Array<boolean>>, hole?: { x: number; y: number; size: number }): string {
  return data.flatMap((row, y) => row.map((dark, x) => (dark && !inBox(x, y, hole) ? `M${x} ${y}h1v1h-1z` : ''))).join('');
}

/**
 * The code as a PNG data URL, `scale` pixels to a module: about 1,000 pixels square for a link,
 * large enough to fill a slide without blurring. `undefined` where the browser cannot draw. With a
 * logo, it waits for the image to load and draws it in `logoBox`; a logo that fails to load leaves the
 * square white, which still reads.
 */
export async function qrPng(
  data: Array<Array<boolean>>,
  options: { color?: string; logo?: string; logoBox?: { x: number; y: number; size: number }; scale?: number } = {}
): Promise<string | undefined> {
  const scale = options.scale ?? 20;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = data.length * scale;

  const context = canvas.getContext('2d');

  if (!context) {
    return undefined;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = options.color ?? '#000000';

  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark && !inBox(x, y, options.logoBox)) {
        context.fillRect(x * scale, y * scale, scale, scale);
      }
    })
  );

  if (options.logo && options.logoBox) {
    const image = await loadImage(options.logo);
    const box = options.logoBox;

    if (image) {
      context.drawImage(image, box.x * scale, box.y * scale, box.size * scale, box.size * scale);
    }
  }

  return canvas.toDataURL('image/png');
}

function inBox(x: number, y: number, box?: { x: number; y: number; size: number }): boolean {
  return box !== undefined && x >= box.x && x < box.x + box.size && y >= box.y && y < box.y + box.size;
}

function loadImage(src: string): Promise<HTMLImageElement | undefined> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = src;
  });
}
