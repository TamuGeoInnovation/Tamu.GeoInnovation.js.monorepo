/**
 * Loads the trip options page when its route opens. A route in another library cannot import the
 * component itself without bringing every trip planner component into the map's first download (#1454).
 */
export const loadTripPlannerOptionsComponent = () =>
  import('./components/trip-planner-options/containers/base/base.component').then((m) => m.TripPlannerOptionsComponent);
