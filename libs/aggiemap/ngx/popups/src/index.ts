export * from './lib/popups';

// The two base classes, for other libraries' popups to extend. The popups themselves are not exported:
// an export here puts a popup, and what it imports, in the application's first download (#1454). Refer
// to them through `Popups`, which loads each one when a popup of its kind first opens.
export * from './lib/components/base/base.popup.component';
export * from './lib/components/base-directions/base-directions.component';
