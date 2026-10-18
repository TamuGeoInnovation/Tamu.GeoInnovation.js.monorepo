import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Zoneless, as the applications this project belongs to run (#1478): only AggieMap and UES Operations
// use it, and they load no zone.js, so a spec here sees change detection as they do. A view updates
// when a signal, an input, a template event or markForCheck says so, never because time passed.
//
// Sets up the TestBed's platform itself (jest-preset-angular 16, #1456), so there is no
// initTestEnvironment here: a second one fails with NG0400. destroyAfterEach: false keeps the
// teardown these specs were written against.
setupZonelessTestEnv({ teardown: { destroyAfterEach: false } });
