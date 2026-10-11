import { lazyPopup } from '@tamu-gisc/maps/esri';

// The popup components by name, for layer and search source definitions to refer to. Each is downloaded
// the first time a popup of its kind opens, not with the page (#1454), so nothing here may import a
// component directly.
export const Popups = {
  BasePopupComponent: lazyPopup(() => import('./components/base/base.popup.component').then((m) => m.BasePopupComponent)),
  BaseDirectionsComponent: lazyPopup(() =>
    import('./components/base-directions/base-directions.component').then((m) => m.BaseDirectionsComponent)
  ),
  AccessiblePopupComponent: lazyPopup(() =>
    import('./components/accessible/accessible.component').then((m) => m.AccessiblePopupComponent)
  ),
  BuildingPopupComponent: lazyPopup(() =>
    import('./components/building/building-popup.component').then((m) => m.BuildingPopupComponent)
  ),
  ConstructionPopupComponent: lazyPopup(() =>
    import('./components/construction/construction.component').then((m) => m.ConstructionPopupComponent)
  ),
  LactationPopupComponent: lazyPopup(() =>
    import('./components/lactation/lactation.component').then((m) => m.LactationPopupComponent)
  ),
  ParkingKioskPopupComponent: lazyPopup(() =>
    import('./components/parking-kiosk/parking-kiosk.component').then((m) => m.ParkingKioskPopupComponent)
  ),
  ParkingLotPopupComponent: lazyPopup(() =>
    import('./components/parking-lot/parking-lot.component').then((m) => m.ParkingLotPopupComponent)
  ),
  ParkingGaragePopupComponent: lazyPopup(() =>
    import('./components/parking-garage/parking-garage.component').then((m) => m.ParkingGaragePopupComponent)
  ),
  RestroomPopupComponent: lazyPopup(() =>
    import('./components/restroom/restroom.component').then((m) => m.RestroomPopupComponent)
  ),
  PoiPopupComponent: lazyPopup(() => import('./components/poi/poi.component').then((m) => m.PoiPopupComponent)),
  BonfirePopupComponent: lazyPopup(() =>
    import('./components/bonfire/bonfire.component').then((m) => m.BonfirePopupComponent)
  ),
  DiningPopupComponent: lazyPopup(() => import('./components/dining/dining.component').then((m) => m.DiningPopupComponent)),
  MarkdownPopupComponent: lazyPopup(() =>
    import('./components/markdown-popup/markdown-popup.component').then((m) => m.MarkdownPopupComponent)
  ),
  MarkdownWDirectionsPopupComponent: lazyPopup(() =>
    import('./components/markdown-w-directions-popup/markdown-w-directions-popup.component').then(
      (m) => m.MarkdownWDirectionsPopupComponent
    )
  ),
  BusStopPopupComponent: lazyPopup(() =>
    import('./components/bus-stop/bus-stop.component').then((m) => m.BusStopPopupComponent)
  )
};
