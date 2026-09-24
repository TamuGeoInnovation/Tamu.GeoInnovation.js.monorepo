import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import {
  ManholeSubmission,
  SidewalkSubmission,
  SignageSubmission,
  StormwaterSubmission
} from '../entities/all.entity';
import { WaybackCompetitionProvider } from './wayback-competition.provider';

describe('WaybackCompetitionProvider', () => {
  let provider: WaybackCompetitionProvider;
  let repos: Record<string, Repository<unknown>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaybackCompetitionProvider,
        { provide: getRepositoryToken(SignageSubmission), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(StormwaterSubmission), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(SidewalkSubmission), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(ManholeSubmission), useValue: { find: jest.fn() } }
      ]
    }).compile();

    provider = module.get<WaybackCompetitionProvider>(WaybackCompetitionProvider);
    repos = {
      signage: module.get(getRepositoryToken(SignageSubmission)),
      stormwater: module.get(getRepositoryToken(StormwaterSubmission)),
      sidewalk: module.get(getRepositoryToken(SidewalkSubmission)),
      manhole: module.get(getRepositoryToken(ManholeSubmission))
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  /**
   * Four near-identical methods over four repositories, which is exactly the shape a copy-paste
   * slip hides in: a wrong repository here would serve one competition's submissions under
   * another's name and nothing about the response would look wrong. Each case asserts both that
   * the right repository was read and that the other three were left alone.
   *
   * Constructing the provider at all is itself meaningful here -- the previous version named
   * injection tokens that do not exist, so it could not have been instantiated.
   */
  describe.each([
    ['getSignageSubmissions', 'signage'],
    ['getStormwaterSubmissions', 'stormwater'],
    ['getSidewalkSubmissions', 'sidewalk'],
    ['getManholeSubmissions', 'manhole']
  ] as const)('.%s()', (method, which) => {
    it(`reads the ${which} repository and no other`, async () => {
      const rows = [{ guid: `${which}-1` }];
      jest.spyOn(repos[which], 'find').mockResolvedValue(rows as never);

      await expect(provider[method]()).resolves.toEqual(rows);

      for (const [name, repo] of Object.entries(repos)) {
        if (name === which) {
          expect(repo.find).toHaveBeenCalled();
        } else {
          expect(repo.find).not.toHaveBeenCalled();
        }
      }
    });
  });
});
