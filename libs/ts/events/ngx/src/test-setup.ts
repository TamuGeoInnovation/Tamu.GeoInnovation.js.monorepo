import 'jest-preset-angular/setup-jest';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Matches the 79 other projects in this workspace. Without an explicit initTestEnvironment the
// TestBed has no platform, and every configureTestingModule call in this project failed with
// "Cannot read properties of undefined (reading 'ngModule')".
getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false }
});
