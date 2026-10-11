/**
 * Load the phone's trip planner panels when a trip route opens. Exporting the components themselves
 * would put them, and the trip planner's directions components, in the map's first download (#1454).
 */
export const loadTripPlannerTopComponent = () =>
  import('./components/trip-planner-top/trip-planner-top.component').then((m) => m.TripPlannerTopComponent);

export const loadTripPlannerBottomComponent = () =>
  import('./components/trip-planner-bottom/trip-planner-bottom.component').then((m) => m.TripPlannerBottomComponent);
