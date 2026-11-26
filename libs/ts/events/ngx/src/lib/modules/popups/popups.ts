import { lazyPopup } from '@tamu-gisc/maps/esri';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

// The event maps' popup components by name, for definitions to refer to. Each is downloaded the first
// time a popup of its kind opens, not with the page (#1454), so nothing here may import a component
// directly.
export const EventPopups = {
  // AggieMap's markdown pair, the one both applications use (#3486). The event maps give them their copy link
  // (`provideEventPopupShareUrl`).
  MarkdownWDirectionsPopupComponent: Popups.MarkdownWDirectionsPopupComponent,
  MarkdownPopupComponent: Popups.MarkdownPopupComponent,
  CampusBuildingPopupComponent: lazyPopup(() =>
    import('./campus-building-popup/campus-building-popup.component').then((m) => m.CampusBuildingPopupComponent)
  )
};
