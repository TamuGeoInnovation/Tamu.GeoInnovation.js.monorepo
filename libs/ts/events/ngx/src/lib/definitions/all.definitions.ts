import { InternalDiscoverApplication } from '@tamu-gisc/aggiemap/ngx/discover';

import { FourHRoundupTs } from './4h-roundup.definitions';
import { AggielandSaturdayEventTs } from './aggieland-saturday.definitions';
import { BigEventTs } from './big-event.definitions';
import { FamilyWeekendTs } from './family-weekend.definitions';
import { GraduationEventTs } from './graduation.definitions';
import { HsGraduationTs } from './hs-graduation.definitions';
import { MaroonWhiteTs } from './maroon-white-game.definitions';
import { MS150Ts } from './ms150.definitions';
import { MusterTs } from './muster.definitions';
import { PhysicsAndEngineeringFestivalTs } from './phys-engineering-festival.definitions';
import { SoftballRegionalsTs } from './softball-regionals.definitions';
import { TroubadourTs } from './troubadour-festival.definitions';
import { FootballParkingEvent } from './football-parking.definitions';

export const EventDefinitions = [
  FourHRoundupTs,
  AggielandSaturdayEventTs,
  BigEventTs,
  FamilyWeekendTs,
  GraduationEventTs,
  HsGraduationTs,
  MaroonWhiteTs,
  MS150Ts,
  MusterTs,
  PhysicsAndEngineeringFestivalTs,
  SoftballRegionalsTs,
  TroubadourTs,
  FootballParkingEvent
];

export const EventDiscoverApplications: InternalDiscoverApplication[] = EventDefinitions.filter(
  (event): event is typeof event & { configuration: NonNullable<typeof event.configuration> } => event.configuration !== null
).map((event) => ({
  id: event.configuration.id,
  source: 'internal' as const,
  type: 'event' as const,
  name: event.configuration.name,
  description:
    event.configuration.introductionText || `Transportation and parking information for ${event.configuration.name}.`,
  configuration: event.configuration
}));
