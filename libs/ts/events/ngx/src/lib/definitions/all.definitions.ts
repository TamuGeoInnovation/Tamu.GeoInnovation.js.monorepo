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

export const EventDiscoverApplications = EventDefinitions.reduce(
  (acc: { [key: string]: { type: 'event'; description: string } }, eventDef) => {
    if (eventDef.configuration) {
      acc[eventDef.configuration.id] = {
        type: 'event',
        description:
          eventDef.configuration.introductionText || eventDef.configuration.applicationName || eventDef.configuration.name
      };
    }
    return acc;
  },
  {}
);
