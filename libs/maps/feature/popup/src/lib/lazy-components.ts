/**
 * Load the phone's popup container when a phone route first shows it. Exporting the component itself
 * would put it, and interactjs behind its drag handle, in every map's first download, desktop included
 * (#1454).
 */
export const loadPopupMobileComponent = () =>
  import('./containers/mobile/mobile.component').then((m) => m.PopupMobileComponent);
