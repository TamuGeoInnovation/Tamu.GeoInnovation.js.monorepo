import { DiscoverApplication, InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { isListed } from './discovery.service';

/**
 * A map as a spec writes one: the few fields the page under test reads, not a whole
 * `InternalDiscoverApplication`. Spelling out two dozen fields to assert a heading is how these stubs grew in the
 * first place.
 */
export type StubApplication = Partial<InternalDiscoverApplication> & { visible?: boolean };

/** Every method a discover component reaches for, as a spec provides them. */
export interface DiscoveryServiceStub {
  getInternalDiscoverApplications: () => StubApplication[];
  listedApplications: (isTesting: boolean) => StubApplication[];
  getVisibleInternalDiscoverApplications: () => StubApplication[];
  getExternalDiscoverApplications: () => Array<Partial<DiscoverApplication>>;
  getAllDiscoverApplications: () => Array<Partial<DiscoverApplication>>;
  getKioskDiscoverApplications: () => StubApplication[];
  getQuickLinkApplications: () => StubApplication[];
}

/**
 * A `DiscoveryService` stand-in for the discover components' specs (#3470).
 *
 * Five specs wrote this list out by hand, each returning nothing from every method it did not care about, because a
 * method the component reaches for and does not find throws during `ngOnInit` - and then the component never renders,
 * which reads as a failure of whatever that spec was actually about. One of them still stubbed a method the service no
 * longer has.
 *
 * Give it only the maps a spec is about, and the rest answer empty:
 *
 * ```ts
 * const discoveryStub = discoveryServiceStub({ getInternalDiscoverApplications: () => [campus, developmentOnlyCampus] });
 * ```
 *
 * `listedApplications` applies the real rule (`isListed`) to whatever `getInternalDiscoverApplications` returns, unless
 * a spec overrides it. So a spec that hands over one published and one development-only map gets the listing a page
 * would really show, on either environment, rather than a second hand-written filter that can drift from the first.
 */
export function discoveryServiceStub(overrides: Partial<DiscoveryServiceStub> = {}): DiscoveryServiceStub {
  const stub: DiscoveryServiceStub = {
    getInternalDiscoverApplications: () => [],
    listedApplications: (isTesting: boolean) =>
      stub.getInternalDiscoverApplications().filter((app) => isListed(app, isTesting)),
    getVisibleInternalDiscoverApplications: () => stub.listedApplications(false),
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => [],
    getKioskDiscoverApplications: () => [],
    getQuickLinkApplications: () => [],
    ...overrides
  };

  return stub;
}
