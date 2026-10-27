/**
 * Replacing one sprite in a vector tile layer's published sprite sheet, at run time (#2459).
 *
 * A hatch in a vector tile style is a `fill-pattern`, and a `fill-pattern` can only name a sprite in
 * the style's own sprite sheet. So a hatch cannot be produced by setting paint properties: the only
 * way to change one from the client is to change the sheet.
 *
 * `VectorTileLayer.setSpriteSource()` takes the sheet as image info rather than a URL
 * (`SpriteSourceImageInfo`, since 4.25), which means the corrected sheet never has to be hosted. These
 * functions fetch the sheet the service publishes, draw one replacement tile into a copy of it, and
 * hand that back to the layer. **Every other sprite stays exactly as published**, because the sheet is
 * read live on each load. A sheet copied into this repository would instead go stale the day the GIS
 * team republishes, and would take the trees, the railroad and the sand courts with it.
 *
 * Why this is needed at all: ArcGIS Pro cannot carry a native hatched fill into a vector tile package
 * (Create Vector Tile Package: "Avoid symbolizing layers with hatched or gradient fills..."). Esri's
 * answer is to author the symbol as a picture fill over a seamless square image whose dimensions are
 * powers of two. The Aggieland basemap's under-construction buildings were left as a native
 * `esriSFSVertical` hatch, and the packager rasterized them into a 30 x 27 tile with **no transparent
 * pixels at all** - 42% of it opaque white - so the pattern paints each building as a solid block
 * instead of a hatch over it.
 *
 * This is an override of published symbology, which `docs/map-layers.md` says must carry its reason.
 * It comes out when the service carries the hatch itself.
 */

import esri = __esri;

/**
 * A hatch to draw into a square sprite tile.
 *
 * `size` is the tile's width and height in pixels, and wants to be a power of two per Esri's guidance.
 * `spacing` must divide `size`, which is what makes the pattern tile without a seam - see
 * `hatchLineStarts`.
 */
export interface HatchSprite {
  /** Width and height of the square tile, in pixels. A power of two. */
  size: number;
  /** Centre-to-centre distance between lines along the x axis, in pixels. Must divide `size`. */
  spacing: number;
  /** Line width in pixels. */
  lineWidth: number;
  /** CSS colour of the lines. The tile is transparent everywhere else. */
  color: string;
  /**
   * Which way the lines run. `grid` is the checkered pattern the under-construction buildings already
   * carry - upright and across - and `diagonalCross` is Esri's `esriSFSDiagonalCross`, the symbol the
   * Construction Zones layer draws for its projects.
   */
  pattern: 'grid' | 'diagonal' | 'diagonalCross';
}

/** One sprite in a layer's published sheet, to be replaced by a hatch tile drawn here. */
export interface SpriteOverride {
  /** The sprite's name in the sheet's index, as the style's `fill-pattern` names it. */
  sprite: string;
  /** What to draw in its place. */
  hatch: HatchSprite;
}

/** One entry of a sprite sheet's index file. */
export interface SpriteIndexEntry {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelRatio?: number;
  sdf?: boolean;
  [key: string]: unknown;
}

/** A sprite sheet's index file: every sprite in the sheet, by name. */
export type SpriteIndex = Record<string, SpriteIndexEntry>;

/**
 * The x positions to start each hatch line from, for a 45-degree hatch that tiles seamlessly.
 *
 * Each line runs from `(x, 0)` to `(x + size, size)`, so it leaves the tile's right edge at exactly the
 * height it entered the left edge of the next one. Starting at `-size` and running to just under
 * `2 * size` draws the lines that cross the tile from off either side, which is what removes the seam:
 * a line leaving the bottom-right has its continuation already drawn at the top-left.
 *
 * `spacing` must divide `size`, or the first line of the next tile would not land where the last line
 * of this one left off, and the pattern would show a seam every `size` pixels - the thing that makes a
 * badly made picture fill obvious. Throwing is better than drawing it: a seam is easy to miss in
 * review and impossible to miss on the map.
 */
export function hatchLineStarts(size: number, spacing: number): number[] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error(`Hatch tile size must be a positive whole number of pixels, not ${size}.`);
  }

  if (!Number.isInteger(spacing) || spacing <= 0) {
    throw new Error(`Hatch spacing must be a positive whole number of pixels, not ${spacing}.`);
  }

  if (size % spacing !== 0) {
    throw new Error(
      `Hatch spacing ${spacing} does not divide the tile size ${size}, so the pattern would show a seam ` +
        `every ${size} pixels. Choose a spacing that divides the size.`
    );
  }

  const starts: number[] = [];

  for (let x = -size; x < size * 2; x += spacing) {
    starts.push(x);
  }

  return starts;
}

/**
 * The offsets to draw each upright and across line at, for a checkered hatch that tiles seamlessly.
 *
 * `spacing` must divide `size` for the same reason it must for the diagonal hatch: the first line of
 * the next tile has to land one spacing on from the last line of this one.
 */
export function gridLineOffsets(size: number, spacing: number): number[] {
  // Borrowed for its argument checking, which is the same for both patterns.
  hatchLineStarts(size, spacing);

  const offsets: number[] = [];

  for (let offset = 0; offset < size; offset += spacing) {
    offsets.push(offset);
  }

  return offsets;
}

/**
 * Where a replacement tile goes in the patched sheet, and the index that describes it.
 *
 * The replacement is appended to the right of the published sheet rather than drawn over the sprite it
 * replaces, because it is a different size - the published construction tile is 30 x 27 and its
 * replacement is 64 x 64. Overwriting in place would leave the old tile's right-hand pixels showing
 * and would overrun whatever sprite sits next to it.
 *
 * Every other entry is returned untouched, so the rest of the sheet keeps the positions it was
 * published with.
 */
export function appendSpriteToIndex(
  index: SpriteIndex,
  name: string,
  size: number,
  sheetWidth: number,
  sheetHeight: number
): { index: SpriteIndex; sheetWidth: number; sheetHeight: number; x: number; y: number } {
  if (index[name] === undefined) {
    throw new Error(
      `The published sprite sheet has no sprite named '${name}', so there is nothing to replace. ` +
        `It may have been renamed when the service was republished.`
    );
  }

  const x = sheetWidth;
  const y = 0;
  const existing = index[name];

  return {
    index: {
      ...index,
      [name]: { ...existing, x, y, width: size, height: size }
    },
    sheetWidth: sheetWidth + size,
    sheetHeight: Math.max(sheetHeight, size),
    x,
    y
  };
}

/**
 * The sheet to read for a device, and the ratio its pixels are in.
 *
 * The same rule Esri's own `setSpriteSource` sample uses. A hatch drawn at 1x and shown on a high-DPI
 * screen is visibly soft, so the tile is drawn at the device's ratio and declared as such.
 */
export function spriteSheetForRatio(spriteUrl: string, devicePixelRatio: number): { json: string; image: string; pixelRatio: number } {
  const highDpi = devicePixelRatio > 1.25;
  const suffix = highDpi ? '@2x' : '';

  return { json: `${spriteUrl}${suffix}.json`, image: `${spriteUrl}${suffix}.png`, pixelRatio: highDpi ? 2 : 1 };
}

/** Draws one seamless hatch tile onto a canvas context, at `(originX, originY)`. */
export function drawHatchTile(
  context: CanvasRenderingContext2D,
  hatch: HatchSprite,
  originX: number,
  originY: number,
  scale: number
): void {
  const size = hatch.size * scale;

  context.save();
  context.beginPath();
  context.rect(originX, originY, size, size);
  context.clip();

  context.strokeStyle = hatch.color;
  context.lineWidth = hatch.lineWidth * scale;
  context.lineCap = 'butt';

  if (hatch.pattern === 'grid') {
    for (const offset of gridLineOffsets(hatch.size, hatch.spacing)) {
      // Half a line width in, so the whole line sits inside the tile rather than straddling its edge.
      // A line centred on 0 loses its left half to the clip and doubles up against its neighbour.
      const at = (offset + hatch.lineWidth / 2) * scale;

      context.beginPath();
      context.moveTo(originX + at, originY);
      context.lineTo(originX + at, originY + size);
      context.stroke();

      context.beginPath();
      context.moveTo(originX, originY + at);
      context.lineTo(originX + size, originY + at);
      context.stroke();
    }
  } else {
    for (const start of hatchLineStarts(hatch.size, hatch.spacing)) {
      context.beginPath();
      context.moveTo(originX + start * scale, originY);
      context.lineTo(originX + start * scale + size, originY + size);
      context.stroke();

      if (hatch.pattern === 'diagonalCross') {
        context.beginPath();
        context.moveTo(originX + start * scale, originY + size);
        context.lineTo(originX + start * scale + size, originY);
        context.stroke();
      }
    }
  }

  context.restore();
}

/** What `applySpriteOverrides` needs from the outside world, so it can be driven in a test. */
export interface SpriteOverrideDeps {
  fetchJson: (url: string) => Promise<SpriteIndex>;
  fetchImage: (url: string) => Promise<CanvasImageSource & { width: number; height: number }>;
  createCanvas: (width: number, height: number) => HTMLCanvasElement;
  devicePixelRatio: number;
}

/** The browser's own implementations, used when nothing else is supplied. */
export function browserSpriteOverrideDeps(): SpriteOverrideDeps {
  return {
    fetchJson: async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Sprite index ${url} answered ${response.status}.`);
      }

      return response.json();
    },
    fetchImage: async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Sprite sheet ${url} answered ${response.status}.`);
      }

      return createImageBitmap(await response.blob());
    },
    createCanvas: (width, height) => {
      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      return canvas;
    },
    devicePixelRatio: window.devicePixelRatio
  };
}

/**
 * Where a layer's overrides wait until the view can show them.
 *
 * `setSpriteSource` has to be called **after the view has made the layer's layer view**, not when the
 * layer loads. Called at load time it resolves without error and is then thrown away: the layer view
 * reads the published sprite sheet when it is created, and whatever was set before that is lost. That
 * is exactly what happened on 27 October - the override ran, resolved, and the buildings stayed pink.
 *
 * So `makeBaseLayer` parks them here and `applyPendingSpriteOverrides` applies them once the view is
 * ready. A `WeakMap` rather than a property on the layer: the layer is Esri's object, and a key that
 * disappears with it cannot leak or collide with theirs.
 */
const pending = new WeakMap<object, SpriteOverride[]>();

/** Remembers a layer's sprite overrides for `applyPendingSpriteOverrides` to apply. */
export function holdSpriteOverrides(layer: object, overrides: SpriteOverride[]): void {
  if (overrides.length > 0) {
    pending.set(layer, overrides);
  }
}

/**
 * Applies the sprite overrides held for every base layer of the view's basemap, once each layer's layer
 * view exists. Safe to call again: a layer's overrides are applied once and then forgotten.
 */
export async function applyPendingSpriteOverrides(
  view: { map?: { basemap?: { baseLayers?: { toArray?: () => unknown[] } } }; whenLayerView: (layer: never) => Promise<unknown> },
  deps: SpriteOverrideDeps = browserSpriteOverrideDeps()
): Promise<void> {
  const layers = view.map?.basemap?.baseLayers?.toArray?.() ?? [];

  await Promise.all(
    layers.map(async (layer) => {
      const overrides = pending.get(layer as object);

      if (overrides === undefined) {
        return;
      }

      pending.delete(layer as object);

      try {
        await view.whenLayerView(layer as never);
        await applySpriteOverrides(layer as esri.VectorTileLayer, overrides, deps);
      } catch (error) {
        // A wrong hatch is better than no map: this must never stop a basemap drawing.
        console.warn(`Could not apply sprite overrides to a basemap layer.`, error);
      }
    })
  );
}

/**
 * Replaces the named sprites in a vector tile layer's published sheet with hatch tiles drawn here.
 *
 * Call it once the layer has loaded, so `currentStyleInfo.spriteUrl` is known. It resolves when the
 * layer has taken the patched sheet.
 */
export async function applySpriteOverrides(
  layer: esri.VectorTileLayer,
  overrides: SpriteOverride[],
  deps: SpriteOverrideDeps
): Promise<void> {
  if (overrides.length === 0) {
    return;
  }

  const spriteUrl = layer.currentStyleInfo?.spriteUrl;

  if (!spriteUrl) {
    throw new Error(`The layer's current style names no sprite sheet, so there is nothing to patch.`);
  }

  const sheet = spriteSheetForRatio(spriteUrl, deps.devicePixelRatio);
  const [publishedIndex, publishedImage] = await Promise.all([
    deps.fetchJson(sheet.json),
    deps.fetchImage(sheet.image)
  ]);

  let index = publishedIndex;
  let width = publishedImage.width;
  let height = publishedImage.height;
  const placements: Array<{ hatch: HatchSprite; x: number; y: number }> = [];

  for (const override of overrides) {
    const placed = appendSpriteToIndex(index, override.sprite, override.hatch.size * sheet.pixelRatio, width, height);

    index = placed.index;
    width = placed.sheetWidth;
    height = placed.sheetHeight;
    placements.push({ hatch: override.hatch, x: placed.x, y: placed.y });
  }

  const canvas = deps.createCanvas(width, height);
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error(`A 2D canvas context is not available, so the sprite sheet cannot be patched.`);
  }

  context.drawImage(publishedImage, 0, 0);

  for (const placement of placements) {
    context.clearRect(placement.x, placement.y, placement.hatch.size * sheet.pixelRatio, placement.hatch.size * sheet.pixelRatio);
    drawHatchTile(context, placement.hatch, placement.x, placement.y, sheet.pixelRatio);
  }

  await layer.setSpriteSource({
    type: 'image',
    spriteUrl,
    pixelRatio: sheet.pixelRatio,
    [sheet.pixelRatio === 2 ? 'spriteSource2x' : 'spriteSource1x']: { image: canvas, json: index }
  } as unknown as Parameters<esri.VectorTileLayer['setSpriteSource']>[0]);
}
