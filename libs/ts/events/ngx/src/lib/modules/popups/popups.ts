import { lazyPopup } from '@tamu-gisc/maps/esri';

// The event maps' popup components by name, for definitions to refer to. Each is downloaded the first
// time a popup of its kind opens, not with the page (#1454), so nothing here may import a component
// directly.
export const EventPopups = {
  MarkdownWDirectionsPopupComponent: lazyPopup(() =>
    import('./markdown-w-directions-popup/markdown-w-directions-popup.component').then(
      (m) => m.MarkdownWDirectionsPopupComponent
    )
  ),
  MarkdownPopupComponent: lazyPopup(() =>
    import('./markdown-popup/markdown-popup.component').then((m) => m.MarkdownPopupComponent)
  ),
  CampusBuildingPopupComponent: lazyPopup(() =>
    import('./campus-building-popup/campus-building-popup.component').then((m) => m.CampusBuildingPopupComponent)
  )
};
