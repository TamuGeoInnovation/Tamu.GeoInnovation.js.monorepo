import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { AssetsService } from '../assets/assets.service';
import { Asset, Event, Organization, Speaker } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let orgRepo: Repository<Organization>;
  let eventRepo: Repository<Event>;
  let seasonService: SeasonService;
  let assetService: AssetsService;

  const org = (guid: string, name: string) => ({ guid, name }) as Organization;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        {
          provide: getRepositoryToken(Event),
          useValue: { find: jest.fn() }
        },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } },
        { provide: AssetsService, useValue: { saveAsset: jest.fn() } }
      ]
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    orgRepo = module.get(getRepositoryToken(Organization));
    eventRepo = module.get(getRepositoryToken(Event));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getOrganizationsForSeason()', () => {
    it('scopes the lookup to the season and orders by name', async () => {
      jest.spyOn(orgRepo, 'find').mockResolvedValue([org('o-1', 'Alpha')]);

      await expect(service.getOrganizationsForSeason('season-1')).resolves.toEqual([
        expect.objectContaining({ guid: 'o-1' })
      ]);
      expect(orgRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        relations: ['season', 'logos'],
        order: { name: 'ASC' }
      });
    });

    /**
     * Documents current behaviour rather than endorsing it.
     *
     * The method wraps `return this.find(...)` in a try/catch that means to answer 500 with
     * "Could not find organizations for season." Nothing is awaited inside the `try`, so the
     * promise rejects after the block has already exited and the `catch` never runs. The raw
     * repository error reaches the caller instead.
     */
    it('lets the underlying repository error through rather than wrapping it', async () => {
      jest.spyOn(orgRepo, 'find').mockRejectedValue(new Error('connection lost'));

      await expect(service.getOrganizationsForSeason('season-1')).rejects.toThrow('connection lost');
    });
  });

  describe('.getOrganizationsForActiveSeason()', () => {
    it('resolves the active season and looks organizations up against it', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active-season' } as never);
      jest.spyOn(orgRepo, 'find').mockResolvedValue([org('o-1', 'Alpha')]);

      await expect(service.getOrganizationsForActiveSeason()).resolves.toEqual([
        expect.objectContaining({ guid: 'o-1' })
      ]);
      expect(orgRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { season: { guid: 'active-season' } } })
      );
    });

    /**
     * The guard below this call -- `if (!activeSeason) throw new UnprocessableEntityException` --
     * is unreachable. `SeasonService.findOneActive()` throws `NotFoundException` when no season is
     * active; it never resolves to a falsy value. Callers therefore see a 404, not the 422 the
     * code appears to promise. Asserting the real status so a future change to either side is
     * visible here.
     */
    it('surfaces NotFound, not UnprocessableEntity, when no season is active', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getOrganizationsForActiveSeason()).rejects.toThrow(NotFoundException);
    });
  });

  describe('.getOrganization() / .getOrganizations()', () => {
    it('requests a single organization with its season and logos', async () => {
      jest.spyOn(orgRepo, 'findOne').mockResolvedValue(org('o-1', 'Alpha'));

      await expect(service.getOrganization('o-1')).resolves.toEqual(
        expect.objectContaining({ guid: 'o-1' })
      );
      expect(orgRepo.findOne).toHaveBeenCalledWith({
        where: { guid: 'o-1' },
        relations: ['season', 'logos']
      });
    });

    it('lists every organization ordered by name', async () => {
      jest.spyOn(orgRepo, 'find').mockResolvedValue([org('o-1', 'Alpha')]);

      await service.getOrganizations();

      expect(orgRepo.find).toHaveBeenCalledWith({
        relations: ['season', 'logos'],
        order: { name: 'ASC' }
      });
    });
  });

  describe('.createOrganization()', () => {
    it('saves the organization without touching assets when no file is supplied', async () => {
      const save = jest.fn().mockResolvedValue(org('o-new', 'Alpha'));
      jest.spyOn(orgRepo, 'create').mockReturnValue({ save } as never);

      await expect(service.createOrganization({ name: 'Alpha' })).resolves.toEqual(
        expect.objectContaining({ guid: 'o-new' })
      );
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('attaches a saved logo and saves a second time when a file is supplied', async () => {
      const saved = { guid: 'o-new', name: 'Alpha' } as Organization & { save: jest.Mock };
      saved.save = jest.fn().mockResolvedValue(saved);
      const create = jest.fn().mockResolvedValue(saved);
      jest.spyOn(orgRepo, 'create').mockReturnValue({ save: create } as never);
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'asset-1' } as never);

      await service.createOrganization({ name: 'Alpha' }, { originalname: 'logo.png' } as never);

      expect(assetService.saveAsset).toHaveBeenCalledWith(
        'images/organizations',
        expect.anything(),
        'organization-logo'
      );
      expect(saved.logos).toEqual([{ guid: 'asset-1' }]);
      expect(saved.save).toHaveBeenCalled();
    });
  });

  describe('.copyOrganizationsIntoSeason()', () => {
    it('rejects when the target season does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(service.copyOrganizationsIntoSeason('missing', ['o-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when none of the requested organizations exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(orgRepo, 'find').mockResolvedValue([]);

      await expect(service.copyOrganizationsIntoSeason('season-2', ['o-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity off the copy so a new row is written rather than the original moved', async () => {
      const source = {
        guid: 'o-1',
        created: new Date(),
        updated: new Date(),
        name: 'Alpha',
        logos: [{ guid: 'asset-1', created: new Date(), updated: new Date() } as Asset]
      } as unknown as Organization;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(orgRepo, 'find').mockResolvedValue([source]);
      jest.spyOn(orgRepo, 'create').mockImplementation(
        (e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never
      );

      await service.copyOrganizationsIntoSeason('season-2', ['o-1']);

      const passed = (orgRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.created).toBeUndefined();
      expect(passed.updated).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      // The logo is one-to-one, so the copy must not carry the original asset's identity with it.
      expect(passed.logos[0].guid).toBeUndefined();
    });
  });

  describe('.updateOrganization()', () => {
    it('throws NotFound when the organization does not exist', async () => {
      jest.spyOn(orgRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updateOrganization('missing', { name: 'Alpha' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('leaves existing logos alone when no replacement file is supplied', async () => {
      const existing = { guid: 'o-1', name: 'Alpha', logos: [{ guid: 'asset-1' }] } as unknown as Organization;
      jest.spyOn(orgRepo, 'findOne').mockResolvedValue(existing);
      jest.spyOn(orgRepo, 'save').mockImplementation((e) => Promise.resolve(e as Organization));

      await service.updateOrganization('o-1', { name: 'Beta' });

      const saved = (orgRepo.save as jest.Mock).mock.calls[0][0];
      // `logos` is deleted from the payload rather than sent as `[undefined]`, which would
      // otherwise detach the existing logo.
      expect('logos' in saved).toBe(false);
      expect(saved.name).toBe('Beta');
    });

    it('replaces the logo when a file is supplied', async () => {
      jest
        .spyOn(orgRepo, 'findOne')
        .mockResolvedValue({ guid: 'o-1', name: 'Alpha', logos: [] } as unknown as Organization);
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'asset-2' } as never);
      jest.spyOn(orgRepo, 'save').mockImplementation((e) => Promise.resolve(e as Organization));

      await service.updateOrganization('o-1', { name: 'Alpha' }, { originalname: 'logo.png' } as never);

      const saved = (orgRepo.save as jest.Mock).mock.calls[0][0];
      expect(saved.logos).toEqual([{ guid: 'asset-2' }]);
    });

    it('does not let the caller overwrite the guid', async () => {
      jest
        .spyOn(orgRepo, 'findOne')
        .mockResolvedValue({ guid: 'o-1', name: 'Alpha', logos: [] } as unknown as Organization);
      jest.spyOn(orgRepo, 'save').mockImplementation((e) => Promise.resolve(e as Organization));

      await service.updateOrganization('o-1', { guid: 'o-hijack', name: 'Beta' } as Partial<Organization>);

      expect((orgRepo.save as jest.Mock).mock.calls[0][0].guid).toBe('o-1');
    });
  });

  describe('.getOrgsWithEvents()', () => {
    it('collects the organizations behind event speakers, without duplicates', async () => {
      const alpha = org('o-1', 'Alpha');
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [{ organization: alpha }, { organization: alpha }] },
        { guid: 'e-2', speakers: [{ organization: org('o-2', 'Beta') }] }
      ] as never);

      const orgs = await service.getOrgsWithEvents();

      expect(orgs.map((o) => o.guid)).toEqual(['o-1', 'o-2']);
    });

    it('tolerates an event with no speakers', async () => {
      jest.spyOn(eventRepo, 'find').mockResolvedValue([{ guid: 'e-1', speakers: [] }] as never);

      await expect(service.getOrgsWithEvents()).resolves.toEqual([]);
    });

    /**
     * A speaker with no organization is a state the code produces itself: `deleteEntities` below
     * sets `speaker.organization = null` on every speaker of an organization it removes. The
     * de-duplication step then reads `org.guid` off that null, so this path is reachable in normal
     * operation rather than only through bad data.
     */
    it('handles a speaker whose organization has been cleared', async () => {
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [{ organization: null }, { organization: org('o-1', 'Alpha') }] }
      ] as never);

      await expect(service.getOrgsWithEvents()).resolves.toEqual([
        expect.objectContaining({ guid: 'o-1' })
      ]);
    });
  });

  describe('.deleteEntities()', () => {
    it('accepts a comma-separated string and a array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 2 }),
        save: jest.fn()
      };
      // Cast through `jest.Mock`: TypeORM's `transaction` is overloaded, and the isolation-level
      // signature wins resolution otherwise.
      (orgRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));

      await service.deleteEntities('o-1,o-2');
      expect(manager.delete).toHaveBeenLastCalledWith(Organization, ['o-1', 'o-2']);

      await service.deleteEntities(['o-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(Organization, ['o-3']);
    });

    it('detaches speakers from the organization before deleting it', async () => {
      const speaker = { guid: 's-1', organization: org('o-1', 'Alpha') } as Speaker;
      const manager = {
        find: jest
          .fn()
          .mockResolvedValueOnce([]) // organizations, for logo collection
          .mockResolvedValueOnce([speaker]), // speakers
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        save: jest.fn().mockResolvedValue([speaker])
      };
      // Cast through `jest.Mock`: TypeORM's `transaction` is overloaded, and the isolation-level
      // signature wins resolution otherwise.
      (orgRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));

      await service.deleteEntities(['o-1']);

      // Without this the delete would fail on the foreign key, or orphan the speaker.
      expect(speaker.organization).toBeNull();
      expect(manager.save).toHaveBeenCalledWith(Speaker, [speaker], { chunk: 25 });
    });

    it('removes logo assets belonging to the organizations being deleted', async () => {
      const logo = { guid: 'asset-1' } as Asset;
      const manager = {
        find: jest
          .fn()
          .mockResolvedValueOnce([{ guid: 'o-1', logos: [logo] }])
          .mockResolvedValueOnce([]),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        save: jest.fn()
      };
      // Cast through `jest.Mock`: TypeORM's `transaction` is overloaded, and the isolation-level
      // signature wins resolution otherwise.
      (orgRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));

      await service.deleteEntities(['o-1']);

      expect(manager.delete).toHaveBeenCalledWith(Asset, [logo]);
    });
  });
});
