import { AccordionService, IAccordionModel } from './accordion.service';

describe('AccordionService', () => {
  let service: AccordionService;

  beforeEach(() => {
    service = new AccordionService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * `state` is a BehaviorSubject, so a subscriber receives the current value immediately and then
   * every subsequent one. These tests therefore record the emission sequence from a single
   * subscription rather than subscribing once per expected value -- the previous version
   * subscribed twice without unsubscribing, so the first subscriber also saw the second emission,
   * failed its assertion, and called `done()` a second time.
   *
   * The emissions are copied on arrival because `toggle()` mutates the state object in place
   * before re-emitting it, so every emission is the same object reference.
   */
  it('should toggle and emit correct values', () => {
    const emissions: Array<IAccordionModel> = [];
    const subscription = service.state.subscribe((state) => emissions.push({ ...state }));

    service.toggle('expanded');
    service.toggle('expanded');

    subscription.unsubscribe();

    expect(emissions).toHaveLength(3);
    expect(emissions[0]).toMatchObject({ expanded: false, resize: false, animate: false });
    expect(emissions[1]).toMatchObject({ expanded: true, resize: false, animate: false });
    expect(emissions[2]).toMatchObject({ expanded: false, resize: false, animate: false });
  });

  it('should update and emit correct values', () => {
    const emissions: Array<IAccordionModel> = [];
    const subscription = service.state.subscribe((state) => emissions.push({ ...state }));

    service.update({ expanded: true, resize: true, animate: true });
    service.update({ expanded: false, resize: true, animate: true });

    subscription.unsubscribe();

    expect(emissions).toHaveLength(3);
    expect(emissions[1]).toMatchObject({ expanded: true, resize: true, animate: true });
    expect(emissions[2]).toMatchObject({ expanded: false, resize: true, animate: true });
  });
});
