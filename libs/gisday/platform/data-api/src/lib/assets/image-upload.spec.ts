import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

import { declaredJpeg, declaredPng } from '@tamu-gisc/common/node/images';

import { refuseUnsafeImage } from './image-upload';

describe('refuseUnsafeImage (#2937)', () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
  // Headers only: a GIF's signature and 1 x 1 screen, and a WebP's RIFF container around a 1 x 1 lossy frame.
  const gif = Buffer.concat([Buffer.from('GIF89a', 'latin1'), Buffer.from([1, 0, 1, 0, 0, 0, 0, 0, 0, 0])]);
  const webp = Buffer.concat([
    Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 \x00\x00\x00\x00', 'latin1'),
    Buffer.from([0, 0, 0, 0x9d, 0x01, 0x2a, 1, 0, 1, 0])
  ]);

  it.each([
    ['an SVG', 'logo.svg', svg],
    ['an SVG renamed to .png', 'logo.png', svg],
    ['an SVG renamed to .jpg', 'logo.jpg', svg],
    ['a GIF', 'logo.gif', gif],
    ['a WebP', 'logo.webp', webp],
    ['text', 'logo.png', Buffer.from('not an image at all')],
    ['an empty file', 'logo.png', Buffer.alloc(0)]
  ])('refuses %s with 400', (_name, originalname, buffer) => {
    expect(() => refuseUnsafeImage({ originalname, buffer }, 'The logo')).toThrow(
      new BadRequestException('The logo must be a JPEG or PNG image.')
    );
  });

  it('refuses a file with no content at all', () => {
    expect(() => refuseUnsafeImage({ originalname: 'logo.png' })).toThrow(BadRequestException);
  });

  it('refuses a small file that declares a huge image with 413', () => {
    expect(() => refuseUnsafeImage({ originalname: 'bomb.png', buffer: declaredPng(50_000, 50_000) })).toThrow(
      PayloadTooLargeException
    );
  });

  it.each([
    ['a PNG', 'logo.png', declaredPng(10, 10), 'logo.png'],
    ['a PNG named .svg', 'logo.svg', declaredPng(10, 10), 'logo.png'],
    ['a PNG named in capitals', 'LOGO.PNG', declaredPng(10, 10), 'LOGO.png'],
    ['a JPEG', 'face.jpg', declaredJpeg(10, 10), 'face.jpg'],
    ['a JPEG named .jpeg', 'face.jpeg', declaredJpeg(10, 10), 'face.jpeg'],
    ['a JPEG named .jfif', 'face.jfif', declaredJpeg(10, 10), 'face.jpg'],
    ['a JPEG named .png', 'face.png', declaredJpeg(10, 10), 'face.jpg'],
    ['a PNG with no extension', 'logo', declaredPng(10, 10), 'logo.png'],
    ['a PNG with a dotted name', 'logo.v2.svg', declaredPng(10, 10), 'logo.v2.png']
  ])('takes %s and names it for its content', (_name, originalname, buffer, stored) => {
    const checked = refuseUnsafeImage({ originalname, buffer, mimetype: 'image/svg+xml' });

    expect(checked.originalname).toBe(stored);
    expect(checked.buffer).toBe(buffer);
    expect(checked.mimetype).toBe(stored.endsWith('.png') ? 'image/png' : 'image/jpeg');
  });
});
