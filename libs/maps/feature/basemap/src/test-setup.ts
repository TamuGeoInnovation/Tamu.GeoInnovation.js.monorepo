import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Sets up the TestBed's platform itself (jest-preset-angular 16, #1456), so there is no
// initTestEnvironment here: a second one fails with NG0400. destroyAfterEach: false keeps the
// teardown these specs were written against.
setupZoneTestEnv({ teardown: { destroyAfterEach: false } });
