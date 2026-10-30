import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { GRADUATION_LAYERS, GraduationColdLayerSources } from './graduation.definitions';

const GRADUATION_DATES = [
  { eventDate: '2026-05-06', value: '2026-05-06T05:00:00.000Z', label: 'Wednesday, May 6th' },
  { eventDate: '2026-05-07', value: '2026-05-07T05:00:00.000Z', label: 'Thursday, May 7th' },
  { eventDate: '2026-05-08', value: '2026-05-08T05:00:00.000Z', label: 'Friday, May 8th' },
  { eventDate: '2026-05-09', value: '2026-05-09T05:00:00.000Z', label: 'Saturday, May 9th' }
] as const;

export const GraduationConfiguration: EventConfiguration = {
  id: 'graduation-spring',
  name: 'Spring Commencement Ceremony',
  applicationName: 'Spring Commencement Transportation Map',
  shortApplicationName: 'Spring Commencement Map',
  introductionText: 'Get the best transportation and parking information for the spring commencement ceremonies.',
  eventDates: GRADUATION_DATES.map(({ eventDate }) => eventDate),
  scheduleUrl: 'https://aggie.tamu.edu/graduation',
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

export const GraduationOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'Please select the day of your commencement or commissioning ceremony to provide the most accurate transportation and parking information.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: GRADUATION_DATES.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: [
        {
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
          conversions: GRADUATION_DATES.map(({ value }) => ({
            input: value,
            propOverrides: { visible: true }
          }))
        }
      ]
    }
  }
];

export const GraduationSpringEventTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for spring graduation ceremonies.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
