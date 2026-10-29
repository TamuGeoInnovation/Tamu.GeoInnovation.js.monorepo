import { Component, computed, input } from '@angular/core';
import { encode } from 'uqr';

import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/**
 * A QR code for `text`, drawn as an SVG so it stays sharp at any size, from a projector to a phone
 * (#2560). With `downloadName` it also offers the code as a PNG, which every slide program accepts.
 */
@Component({
  selector: 'tamu-gisc-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  imports: [ButtonComponent]
})
export class QrCodeComponent {
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

  public readonly modules = computed(() => qrModules(this.text()));

  /**
   * Every dark module as one SVG path, a 1 x 1 square each, in a box `modules().size` wide.
   */
  public readonly path = computed(() => qrPath(this.modules().data));

  public download() {
    const png = qrPng(this.modules().data);

    if (!png) {
      return;
    }

    const link = document.createElement('a');
    link.href = png;
    link.download = `${this.downloadName()}.png`;
    link.click();
  }
}

/**
 * The code's modules, `true` for dark, with the four-module quiet zone the standard asks for so a
 * phone can find it on a busy slide. Medium error correction, so a code that is a little blurred
 * or partly covered still reads.
 */
export function qrModules(text: string): { size: number; data: Array<Array<boolean>> } {
  const { size, data } = encode(text ?? '', { ecc: 'M', border: 4 });

  return { size, data };
}

/**
 * An SVG path drawing every dark module as a unit square.
 */
export function qrPath(data: Array<Array<boolean>>): string {
  return data
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : '')))
    .join('');
}

/**
 * The code as a PNG data URL, `scale` pixels to a module: about 1,000 pixels square for a link,
 * large enough to fill a slide without blurring. `undefined` where the browser cannot draw.
 */
export function qrPng(data: Array<Array<boolean>>, scale = 20): string | undefined {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = data.length * scale;

  const context = canvas.getContext('2d');

  if (!context) {
    return undefined;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000000';

  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) {
        context.fillRect(x * scale, y * scale, scale, scale);
      }
    })
  );

  return canvas.toDataURL('image/png');
}
