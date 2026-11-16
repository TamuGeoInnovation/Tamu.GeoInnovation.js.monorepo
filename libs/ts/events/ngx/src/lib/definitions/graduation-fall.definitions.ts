import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { GRADUATION_LAYERS, GraduationColdLayerSources } from './graduation.definitions';

// Fall 2026, from the registrar's own schedule (#2754):
// aggie.tamu.edu/graduation-and-beyond/commencement-details/graduation-schedule.html
//
// These were left on December 2025 for eleven months. Nothing caught it: the labels carry no year,
// and 17 December really was a Wednesday in 2025, so the builder read as correct. The dates are
// configuration rather than a service, so the map went on loading and drawing and the smoke suite
// went on passing.
const GRADUATION_DATES = [
  { eventDate: '2026-12-11', value: '2026-12-11T06:00:00.000Z', label: 'Friday, December 11th' },
  { eventDate: '2026-12-12', value: '2026-12-12T06:00:00.000Z', label: 'Saturday, December 12th' }
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
