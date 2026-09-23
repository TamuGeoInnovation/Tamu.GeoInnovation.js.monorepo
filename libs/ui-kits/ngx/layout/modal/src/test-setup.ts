import 'jest-preset-angular/setup-jest';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Explicit platform initialisation, matching the majority of projects in this workspace. Without
// it the TestBed has no platform and every configureTestingModule call fails with
// "Cannot read properties of undefined (reading 'ngModule')".
getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false }
});
