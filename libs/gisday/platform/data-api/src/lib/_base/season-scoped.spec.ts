import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { ClassProvider } from '../class/class.provider';
import { EventProvider } from '../event/event.provider';
import { EventBroadcastService } from '../event-broadcast/event-broadcast.service';
import { EventLocationService } from '../event-location/event-location.service';
import { OrganizationService } from '../organization/organization.service';
import { PlaceService } from '../place/place.service';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SponsorProvider } from '../sponsor/sponsor.provider';
import { TagProvider } from '../tag/tag.provider';
import { UniversityProvider } from '../university/university.provider';

/**
 * The ten season-scoped providers (#3324): their records for the active season, and copying records into a season.
 * Each wrote these itself, and fixes reached one copy each.
 */

/** A provider made bare, with `seasons` as its season service under whichever name it reads it by. */
function bare<T extends object>(type: { prototype: T }, seasons: object, repo: object = {}): T {
  return Object.assign(Object.create(type.prototype), {
    seasonService: seasons,
    seasonProvider: seasons,
    ss: seasons,
    repo,
    eb: repo
  }) as T;
}

describe("the active season's records, on every season-scoped provider (#3324)", () => {
  // SeasonService.findOneActive throws 404 itself when there is no active season, so each provider's own
  // `throw 422 'No active season found.'` could never run. Pinned before it goes: the answer is 404.
  const none = { findOneActive: () => Promise.reject(new NotFoundException('No active season found.')) };

  it.each([
    ['ClassProvider', () => bare(ClassProvider, none).getClassesForActiveSeason()],
    ['EventProvider', () => bare(EventProvider, none).getEventsForActiveSeason()],
    ['EventBroadcastService', () => bare(EventBroadcastService, none).getBroadcastsForActiveSeason()],
    ['EventLocationService', () => bare(EventLocationService, none).getEventLocationsForActiveSeason()],
    ['OrganizationService', () => bare(OrganizationService, none).getOrganizationsForActiveSeason()],
    ['PlaceService', () => bare(PlaceService, none).getPlacesForActiveSeason()],
    ['SpeakerProvider', () => bare(SpeakerProvider, none).getSpeakersForActiveSeason()],
    ['SponsorProvider', () => bare(SponsorProvider, none).getSponsorsForActiveSeason()],
    ['TagProvider', () => bare(TagProvider, none).getTagsForActiveSeason()],
    ['UniversityProvider', () => bare(UniversityProvider, none).getEntitiesForActiveSeason()]
  ])('%s answers 404 when there is no active season', async (_name, ask) => {
    await expect(ask()).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('copying records into a season (#3324)', () => {
  // Every other provider checked the season exists and that something was found to copy; the broadcasts' copy did
  // neither, so it wrote broadcasts into a season that did not exist, and answered an empty list for guids that
  // matched nothing. Red on today's code.
  it('refuses to copy broadcasts into a season that does not exist', async () => {
    const repo = { find: jest.fn(async () => [{ guid: 'b-1', name: 'Made-up broadcast' }]), create: jest.fn((x) => ({ ...x, save: async () => x })), save: jest.fn(async (x) => x) };
    const service = bare(EventBroadcastService, { findOne: async () => null }, repo);

    await expect(service.copyBroadcastsIntoSeason('no-such-season', ['b-1'])).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('refuses to copy broadcasts when none of them is found', async () => {
    const repo = { find: jest.fn(async () => []), create: jest.fn((x) => x), save: jest.fn(async (x) => x) };
    const service = bare(EventBroadcastService, { findOne: async () => ({ guid: 's-2027' }) }, repo);

    await expect(service.copyBroadcastsIntoSeason('s-2027', ['no-such-broadcast'])).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
