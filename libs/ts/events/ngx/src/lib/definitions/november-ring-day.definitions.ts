import { RING_DAY_LAYERS, ringDayMap } from './ring-day.definitions';

// Built by `ringDayMap` with October's and April's (#2599). Its layer names are the same enum as theirs, under the name
// this file has always exported.
export const NOVEMBER_RING_DAY_LAYERS = RING_DAY_LAYERS;
export type NOVEMBER_RING_DAY_LAYERS = RING_DAY_LAYERS;

const NovemberRingDay = ringDayMap({
  id: 'november-ring-day',
  name: 'November Ring Day',
  toastName: 'November Ring Day',
  periodDescription:
    'Select the November Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
  columnKey: 'fall',
  periods: [
    {
      value: 'day1',
      label: 'Aggie Ring Pickup (November 5, 2026)',
      dates: ['2026-11-05'],
      // Pickup parking and the Williams Alumni Center. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3354, 30.6095], zoom: 18 }
    },
    {
      value: 'day2',
      label: 'Aggie Ring Day (November 6, 2026)',
      dates: ['2026-11-06'],
      // Aggie Park out to the West Campus Garage shuttle loop. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3405, 30.6088], zoom: 17 }
    }
  ]
});

export const NovemberRingDayColdLayerSources = NovemberRingDay.sources;
export const NovemberRingDayConfiguration = NovemberRingDay.configuration;
export const NovemberRingDaySpecialEventOptions = NovemberRingDay.options;
export const NovemberRingDayEvent = NovemberRingDay.event;
