import { RING_DAY_LAYERS, ringDayMap } from './ring-day.definitions';

// Built by `ringDayMap` with November's and April's (#2599). The layer names are one enum for all three.
export { RING_DAY_LAYERS };

const RingDay = ringDayMap({
  id: 'ring-day',
  name: 'October Ring Day',
  toastName: 'Ring Day',
  periodDescription:
    'Select which Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
  columnKey: 'fall',
  periods: [
    {
      value: 'day1',
      label: 'Aggie Ring Pickup (October 8, 2026)',
      dates: ['2026-10-08'],
      // Pickup parking and the Williams Alumni Center. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3354, 30.6095], zoom: 18 }
    },
    {
      value: 'day2',
      label: 'Aggie Ring Day (October 9-10, 2026)',
      dates: ['2026-10-09', '2026-10-10'],
      // Aggie Park out to the West Campus Garage shuttle loop. Tune center/zoom here to adjust framing.
      mapView: { center: [-96.3405, 30.6088], zoom: 17 }
    }
  ]
});

export const RingDayColdLayerSources = RingDay.sources;
export const RingDayConfiguration = RingDay.configuration;
export const RingDaySpecialEventOptions = RingDay.options;
export const RingDayEvent = RingDay.event;
