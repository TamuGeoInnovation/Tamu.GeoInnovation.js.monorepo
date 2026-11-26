export * from './lib/popups';

// The two base classes, for other libraries' popups to extend. The popups themselves are not exported:
// an export here puts a popup, and what it imports, in the application's first download (#1454). Refer
// to them through `Popups`, which loads each one when a popup of its kind first opens.
export * from './lib/components/base/base.popup.component';
export * from './lib/components/base-directions/base-directions.component';

// The footer every popup with "Directions To Here" ends with (#602, #1173), for other libraries' popups to use. A
// component is downloaded with the popup that imports it, so exporting it adds nothing to the first download.
export * from './lib/components/footer/popup-footer.component';

// How an application gives the markdown popups their copy link (#3486). The event maps provide it.
export * from './lib/popup-share-url';
