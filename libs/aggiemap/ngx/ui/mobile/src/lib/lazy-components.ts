/**
 * Load the phone's trip planner panels when a trip route opens, and its bus panels when a bus route
 * opens. Exporting the components themselves would put them in the map's first download (#1454): the
 * trip planner's with its directions components, the bus panels with interactjs, behind their drag
 * handles.
 */
export const loadTripPlannerTopComponent = () =>
  import('./components/trip-planner-top/trip-planner-top.component').then((m) => m.TripPlannerTopComponent);

export const loadTripPlannerBottomComponent = () =>
  import('./components/trip-planner-bottom/trip-planner-bottom.component').then((m) => m.TripPlannerBottomComponent);

export const loadBusListBottomComponent = () =>
  import('./components/bus-list-bottom/bus-list-bottom.component').then((m) => m.BusListBottomComponent);

export const loadBusTimetableBottomComponent = () =>
  import('./components/bus-timetable-bottom/bus-timetable-bottom.component').then((m) => m.BusTimetableBottomComponent);
