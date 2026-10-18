import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Zoneless (#1478): AggieMap renders this project's components with no zone.js loaded, so a spec here
// sees change detection as AggieMap does. A component that updates zoneless also updates under the
// zone the other applications still load, so one setting covers both.
//
// Sets up the TestBed's platform itself (jest-preset-angular 16, #1456), so there is no
// initTestEnvironment here: a second one fails with NG0400. destroyAfterEach: false keeps the
// teardown these specs were written against.
setupZonelessTestEnv({ teardown: { destroyAfterEach: false } });
