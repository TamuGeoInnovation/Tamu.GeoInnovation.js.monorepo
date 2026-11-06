// Its own entry point, apart from index.ts: the alert modal brings in the shared form controls for its buttons, and
// an app that only opens modals of its own should not compile them. mailroom-angular's stricter build fails on them
// (#2662).
export * from './lib/components/alert-modal/alert-modal.component';
