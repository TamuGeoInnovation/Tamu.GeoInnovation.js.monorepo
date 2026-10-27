import { describe, expect, it, vi } from 'vitest';

import {
  appendSpriteToIndex,
  applySpriteOverrides,
  drawHatchTile,
  gridLineOffsets,
  hatchLineStarts,
  SpriteIndex,
  spriteSheetForRatio
} from './vector-tile-sprites';

describe('hatchLineStarts', () => {
  it('covers the tile from off both sides, so the lines meet across its edges', () => {
    // A line starting at -64 leaves the tile's bottom edge where the line starting at 0 enters its
    // top edge in the tile below. Without those two the pattern shows a seam every 64 pixels.
    const starts = hatchLineStarts(64, 16);

    expect(starts[0]).toBe(-64);
    expect(starts).toContain(0);
    expect(starts[starts.length - 1]).toBe(112);
  });

  it('spaces the lines evenly', () => {
    const starts = hatchLineStarts(64, 16);
    const gaps = starts.slice(1).map((start, index) => start - starts[index]);

    expect(new Set(gaps)).toEqual(new Set([16]));
  });

  it('refuses a spacing that does not divide the size, because it would seam', () => {
    // 27 and 30 are the dimensions the packager actually produced for this sprite. A tile that does
    // not divide evenly is exactly how a picture fill ends up with a visible repeat.
    expect(() => hatchLineStarts(30, 27)).toThrow(/seam/);
  });

  it('refuses sizes and spacings that are not whole positive pixel counts', () => {
    expect(() => hatchLineStarts(0, 16)).toThrow(/size/);
    expect(() => hatchLineStarts(64, 0)).toThrow(/spacing/);
    expect(() => hatchLineStarts(64.5, 16)).toThrow(/size/);
  });
});

describe('gridLineOffsets', () => {
  it('spaces the lines evenly across the tile, once each', () => {
    expect(gridLineOffsets(32, 4)).toEqual([0, 4, 8, 12, 16, 20, 24, 28]);
  });

  it('refuses a spacing that does not divide the size, because it would seam', () => {
    expect(() => gridLineOffsets(30, 27)).toThrow(/seam/);
  });
});

describe('appendSpriteToIndex', () => {
  const index: SpriteIndex = {
    'Campus Structures/Currently Under Construction/1': { x: 208, y: 84, width: 30, height: 27 },
    'Trees/0 - 3': { x: 0, y: 0, width: 9, height: 9 }
  };

  it('puts the replacement beside the published sheet rather than over the sprite it replaces', () => {
    // Drawing a 64 x 64 tile over a 30 x 27 one would leave the old tile's pixels showing and would
    // overrun whatever sits next to it in the sheet.
    const placed = appendSpriteToIndex(index, 'Campus Structures/Currently Under Construction/1', 64, 241, 151);

    expect(placed.x).toBe(241);
    expect(placed.y).toBe(0);
    expect(placed.sheetWidth).toBe(305);
    expect(placed.sheetHeight).toBe(151);
  });

  it('points the named sprite at the replacement and leaves every other sprite where it was', () => {
    const placed = appendSpriteToIndex(index, 'Campus Structures/Currently Under Construction/1', 64, 241, 151);

    expect(placed.index['Campus Structures/Currently Under Construction/1']).toEqual({
      x: 241,
      y: 0,
      width: 64,
      height: 64
    });
    expect(placed.index['Trees/0 - 3']).toEqual({ x: 0, y: 0, width: 9, height: 9 });
  });

  it('grows the sheet when the replacement is taller than it', () => {
    const placed = appendSpriteToIndex(index, 'Trees/0 - 3', 256, 241, 151);

    expect(placed.sheetHeight).toBe(256);
  });

  it('says so when the sprite is not in the published sheet', () => {
    // A republish that renames the layer would otherwise patch nothing and report nothing.
    expect(() => appendSpriteToIndex(index, 'Campus Structures/Renamed', 64, 241, 151)).toThrow(/no sprite named/);
  });
});

describe('spriteSheetForRatio', () => {
  it('reads the ordinary sheet on an ordinary screen', () => {
    expect(spriteSheetForRatio('https://example.com/sprites/sprite', 1)).toEqual({
      json: 'https://example.com/sprites/sprite.json',
      image: 'https://example.com/sprites/sprite.png',
      pixelRatio: 1
    });
  });

  it('reads the high-DPI sheet on a high-DPI screen, so the hatch is not soft', () => {
    expect(spriteSheetForRatio('https://example.com/sprites/sprite', 2)).toEqual({
      json: 'https://example.com/sprites/sprite@2x.json',
      image: 'https://example.com/sprites/sprite@2x.png',
      pixelRatio: 2
    });
  });
});

describe('drawHatchTile', () => {
  function recordingContext() {
    const calls: string[] = [];

    return {
      calls,
      context: {
        save: () => calls.push('save'),
        restore: () => calls.push('restore'),
        beginPath: () => calls.push('beginPath'),
        rect: (...args: number[]) => calls.push(`rect(${args.join(',')})`),
        clip: () => calls.push('clip'),
        moveTo: (...args: number[]) => calls.push(`moveTo(${args.join(',')})`),
        lineTo: (...args: number[]) => calls.push(`lineTo(${args.join(',')})`),
        stroke: () => calls.push('stroke'),
        strokeStyle: '',
        lineWidth: 0,
        lineCap: ''
      } as unknown as CanvasRenderingContext2D
    };
  }

  it('draws a checkered grid in the colour it was given, clipped to the tile', () => {
    const { calls, context } = recordingContext();

    drawHatchTile(context, { size: 32, spacing: 4, lineWidth: 1, color: 'rgb(230, 152, 0)', pattern: 'grid' }, 241, 0, 1);

    expect(context.strokeStyle).toBe('rgb(230, 152, 0)');
    expect(context.lineWidth).toBe(1);
    expect(calls).toContain('rect(241,0,32,32)');
    expect(calls).toContain('clip');
    // Upright and across, which is what makes it checkered rather than striped.
    expect(calls).toContain('moveTo(241.5,0)');
    expect(calls).toContain('lineTo(241.5,32)');
    expect(calls).toContain('moveTo(241,0.5)');
    expect(calls).toContain('lineTo(273,0.5)');
  });

  it('keeps each grid line inside the tile, so it does not double up at the edges', () => {
    // A line centred on the tile's edge loses half to the clip and lands on top of its neighbour in
    // the next tile, which is a heavier line every 32 pixels - a seam.
    const { calls, context } = recordingContext();

    drawHatchTile(context, { size: 32, spacing: 4, lineWidth: 1, color: 'orange', pattern: 'grid' }, 0, 0, 1);

    expect(calls).not.toContain('moveTo(0,0)');
    expect(calls).toContain('moveTo(0.5,0)');
  });

  it('draws lines at 45 degrees when asked for a diagonal', () => {
    const { calls, context } = recordingContext();

    drawHatchTile(context, { size: 64, spacing: 16, lineWidth: 4, color: 'orange', pattern: 'diagonal' }, 241, 0, 1);

    // Each line drops by exactly as much as it runs across, which is 45 degrees.
    expect(calls).toContain('moveTo(241,0)');
    expect(calls).toContain('lineTo(305,64)');
    // One direction only.
    expect(calls).not.toContain('moveTo(241,64)');
  });

  it('crosses the diagonals when asked for a diagonal cross', () => {
    const { calls, context } = recordingContext();

    drawHatchTile(context, { size: 64, spacing: 16, lineWidth: 4, color: 'orange', pattern: 'diagonalCross' }, 241, 0, 1);

    expect(calls).toContain('lineTo(305,64)');
    expect(calls).toContain('moveTo(241,64)');
  });

  it('draws the tile at the device ratio it was given', () => {
    const { calls, context } = recordingContext();

    drawHatchTile(context, { size: 64, spacing: 16, lineWidth: 4, color: 'orange', pattern: 'diagonal' }, 0, 0, 2);

    expect(context.lineWidth).toBe(8);
    expect(calls).toContain('rect(0,0,128,128)');
  });
});

describe('applySpriteOverrides', () => {
  const publishedIndex: SpriteIndex = {
    'Campus Structures/Currently Under Construction/1': { x: 208, y: 84, width: 30, height: 27 },
    'Sports and Rec Fields/Sand Courts/1': { x: 0, y: 0, width: 64, height: 64 }
  };

  function deps(overrides: Partial<Parameters<typeof applySpriteOverrides>[2]> = {}) {
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: ''
    };
    const canvas = { width: 0, height: 0, getContext: () => context } as unknown as HTMLCanvasElement;

    return {
      context,
      canvas,
      deps: {
        fetchJson: vi.fn().mockResolvedValue(publishedIndex),
        fetchImage: vi.fn().mockResolvedValue({ width: 241, height: 151 }),
        createCanvas: vi.fn().mockReturnValue(canvas),
        devicePixelRatio: 1,
        ...overrides
      }
    };
  }

  function layer(spriteUrl: string | null = 'https://example.com/sprites/sprite') {
    return {
      currentStyleInfo: { spriteUrl },
      setSpriteSource: vi.fn().mockResolvedValue(undefined)
    } as unknown as __esri.VectorTileLayer & { setSpriteSource: ReturnType<typeof vi.fn> };
  }

  const override = {
    sprite: 'Campus Structures/Currently Under Construction/1',
    hatch: { size: 64, spacing: 16, lineWidth: 4, color: 'rgb(230, 152, 0)', pattern: 'grid' as const }
  };

  it('hands the layer a patched sheet that points the sprite at the hatch', async () => {
    // This is the fix: unpatched, the layer keeps the published 30 x 27 tile, which has no
    // transparent pixels and so paints each building solid.
    const target = layer();
    const { deps: d } = deps();

    await applySpriteOverrides(target, [override], d);

    const [argument] = target.setSpriteSource.mock.calls[0];

    expect(argument.type).toBe('image');
    expect(argument.pixelRatio).toBe(1);
    expect(argument.spriteSource1x.json['Campus Structures/Currently Under Construction/1']).toEqual({
      x: 241,
      y: 0,
      width: 64,
      height: 64
    });
  });

  it('leaves every other sprite exactly as the service published it', async () => {
    // The whole reason the sheet is read live rather than copied into the repository.
    const target = layer();
    const { deps: d } = deps();

    await applySpriteOverrides(target, [override], d);

    const [argument] = target.setSpriteSource.mock.calls[0];

    expect(argument.spriteSource1x.json['Sports and Rec Fields/Sand Courts/1']).toEqual({
      x: 0,
      y: 0,
      width: 64,
      height: 64
    });
  });

  it('draws the published sheet first and clears the space the hatch goes in', async () => {
    const target = layer();
    const { deps: d, context } = deps();

    await applySpriteOverrides(target, [override], d);

    expect(context.drawImage).toHaveBeenCalledWith({ width: 241, height: 151 }, 0, 0);
    expect(context.clearRect).toHaveBeenCalledWith(241, 0, 64, 64);
  });

  it('reads the high-DPI sheet and declares it when the screen is high-DPI', async () => {
    const target = layer();
    const { deps: d } = deps({ devicePixelRatio: 2 });

    await applySpriteOverrides(target, [override], d);

    expect(d.fetchJson).toHaveBeenCalledWith('https://example.com/sprites/sprite@2x.json');
    expect(target.setSpriteSource.mock.calls[0][0].pixelRatio).toBe(2);
  });

  it('does nothing at all when no overrides are asked for', async () => {
    const target = layer();
    const { deps: d } = deps();

    await applySpriteOverrides(target, [], d);

    expect(d.fetchJson).not.toHaveBeenCalled();
    expect(target.setSpriteSource).not.toHaveBeenCalled();
  });

  it('says so when the style names no sprite sheet', async () => {
    const target = layer(null);
    const { deps: d } = deps();

    await expect(applySpriteOverrides(target, [override], d)).rejects.toThrow(/no sprite sheet/);
  });
});
