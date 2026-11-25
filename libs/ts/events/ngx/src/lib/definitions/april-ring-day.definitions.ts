import { RING_DAY_LAYERS, ringDayMap } from './ring-day.definitions';

// Built by `ringDayMap` with October's and November's (#2599). Its layer names are the same enum as theirs, under the
// name this file has always exported.
export const APRIL_RING_DAY_LAYERS = RING_DAY_LAYERS;
export type APRIL_RING_DAY_LAYERS = RING_DAY_LAYERS;

const AprilRingDay = ringDayMap({
  id: 'april-ring-day',
  name: 'April Ring Day',
  toastName: 'April Ring Day',
  periodDescription:
    'Select which April Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
  columnKey: 'spring',
  periods: [
    {
      value: 'day1',
      label: 'Aggie Ring Pickup (April 9, 2026)',
      dates: ['2026-04-09'],
      // Pickup parking and the Williams Alumni Center. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3354, 30.6095], zoom: 18 }
    },
    {
      value: 'day2',
      label: 'Aggie Ring Day (April 10, 2026)',
      dates: ['2026-04-10'],
      // Aggie Park out to the West Campus Garage shuttle loop. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3405, 30.6088], zoom: 17 }
    }
  ]
});

export const AprilRingDayColdLayerSources = AprilRingDay.sources;
export const AprilRingDayConfiguration = AprilRingDay.configuration;
export const AprilRingDaySpecialEventOptions = AprilRingDay.options;
export const AprilRingDayEvent = AprilRingDay.event;
