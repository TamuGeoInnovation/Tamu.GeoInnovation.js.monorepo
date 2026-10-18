import { addTrack, useZoomComponent } from './map-controls';

import esri = __esri;

// The components are browser custom elements; jsdom only needs the tags.
jest.mock('@arcgis/map-components/components/arcgis-zoom', () => ({}), { virtual: true });
jest.mock('@arcgis/map-components/components/arcgis-track', () => ({}), { virtual: true });

/** Esri's zoom and locate components in place of the deprecated widgets (#1853). */
describe('map controls', () => {
  function makeView(components: string[]) {
    return { ui: { components, add: jest.fn() } } as unknown as esri.MapView & { ui: { add: jest.Mock } };
  }

  /** Lets the components' definitions "load". */
  const loaded = () => new Promise((resolve) => setTimeout(resolve));

  describe('useZoomComponent', () => {
    it("puts <arcgis-zoom> first in the top left in place of the view's Zoom widget", async () => {
      const view = makeView(['attribution', 'zoom']);

      useZoomComponent(view);

      expect(view.ui.components).toEqual(['attribution']);

      const [element, position] = view.ui.add.mock.calls[0];

      expect(element.tagName).toBe('ARCGIS-ZOOM');
      expect(position).toEqual({ position: 'top-left', index: 0 });

      await loaded();

      expect(element.view).toBe(view);
      // Kept when the perspective toggle takes the 2D view off the page for 3D.
      expect(element.autoDestroyDisabled).toBe(true);
    });

    it('adds nothing to a view that asks for no zoom buttons, such as the phone map', () => {
      const view = makeView(['attribution']);

      useZoomComponent(view);

      expect(view.ui.components).toEqual(['attribution']);
      expect(view.ui.add).not.toHaveBeenCalled();
    });

    it('adds the buttons once, however often it is called for a view', () => {
      const view = makeView(['attribution', 'zoom']);

      useZoomComponent(view);
      useZoomComponent(view);

      expect(view.ui.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('addTrack', () => {
    it('goes below the zoom buttons in the top left', async () => {
      const view = makeView([]);

      addTrack(view, 'top-left');

      const [element, position] = view.ui.add.mock.calls[0];

      expect(element.tagName).toBe('ARCGIS-TRACK');
      expect(position).toEqual({ position: 'top-left', index: 1 });

      await loaded();

      expect(element.view).toBe(view);
    });

    it('goes in the bottom right on a phone', () => {
      const view = makeView([]);

      addTrack(view, 'bottom-right');

      expect(view.ui.add.mock.calls[0][1]).toBe('bottom-right');
    });

    it('follows the device without moving the map to it, and turns the map to its heading', async () => {
      const view = makeView([]);

      addTrack(view, 'top-left');
      await loaded();

      const element = view.ui.add.mock.calls[0][0];

      expect(element.goToLocationDisabled).toBe(true);
      // Kept when the perspective toggle takes the 2D view off the page for 3D.
      expect(element.autoDestroyDisabled).toBe(true);
      // Rotation is the component's default; the widget had to be asked for it.
      expect(element.rotationDisabled).toBeUndefined();
    });
  });
});
