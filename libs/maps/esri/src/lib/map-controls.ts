import esri = __esri;

/**
 * Esri's map components for the zoom and locate buttons, attached to one of our views (#1853).
 *
 * ArcGIS 4.34 deprecates the widgets behind these buttons in favour of web components. The components
 * take an existing view (`el.view = view`) and sit in its UI like a widget, so the views, the map
 * service and the 2D/3D toggle are unchanged. The compass is our own, `MapCompassComponent`.
 *
 * Each element goes into the view's UI at once, so its place among the controls is fixed, and is given
 * the view once its definition has loaded.
 *
 * Each is told not to destroy itself when it leaves the page. A component does that by default, and the
 * perspective toggle takes the 2D view off the page while 3D is shown: back in 2D, the zoom and locate
 * buttons had gone. The view keeps them, as it kept the widgets.
 */

/**
 * Puts `<arcgis-zoom>` where the view's default Zoom widget would be, if it has one.
 *
 * A view shows the widget when `ui.components` names `'zoom'`, which it does by default. The map service
 * calls this for every view it shows, so a map asks for zoom buttons as it always has.
 */
export function useZoomComponent(view: esri.MapView | esri.SceneView): void {
  if (!view.ui.components.includes('zoom')) {
    return;
  }

  view.ui.components = view.ui.components.filter((component) => component !== 'zoom');

  const zoom = document.createElement('arcgis-zoom');

  view.ui.add(zoom, { position: 'top-left', index: 0 });

  import('@arcgis/map-components/components/arcgis-zoom').then(() => {
    zoom.autoDestroyDisabled = true;
    zoom.view = view;
  });
}

/**
 * Adds `<arcgis-track>`, the locate button: it follows the device's position, turning the map to its
 * heading, without moving the map to it.
 *
 * In the top left it goes second, below the zoom buttons and above the compass, whichever of those is
 * added first.
 */
export function addTrack(view: esri.MapView, position: 'top-left' | 'bottom-right'): void {
  const track = document.createElement('arcgis-track');

  view.ui.add(track, position === 'top-left' ? { position, index: 1 } : position);

  import('@arcgis/map-components/components/arcgis-track').then(() => {
    track.autoDestroyDisabled = true;
    track.goToLocationDisabled = true;
    track.view = view;
  });
}
