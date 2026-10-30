import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { GRADUATION_LAYERS, GraduationColdLayerSources } from './graduation.definitions';

const GRADUATION_DATES = [
  { eventDate: '2025-12-17', value: '2025-12-17T05:00:00.000Z', label: 'Wednesday, December 17th' },
  { eventDate: '2025-12-18', value: '2025-12-18T05:00:00.000Z', label: 'Thursday, December 18th' }
] as const;

export const GraduationConfiguration: EventConfiguration = {
  id: 'graduation-fall',
  name: 'Fall Commencement Ceremony',
  applicationName: 'Fall Commencement Transportation Map',
  shortApplicationName: 'Fall Commencement Map',
  introductionText: 'Get the best transportation and parking information for the fall commencement ceremonies.',
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
            propOverrides: {
              visible: true
            }
          }))
        }
      ]
    }
  }
];

export const GraduationFallEventTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for fall graduation ceremonies.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
