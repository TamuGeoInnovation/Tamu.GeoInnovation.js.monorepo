import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { Organization, University } from '../entities/all.entity';

/** How long a profile, once read, is used again rather than read again. */
export const PROFILE_KEPT_MS = 5 * 60 * 1000;

/**
 * What every admin dashboard reads about people (#2878, #2892): accounts' Auth0 profiles, read many at a time and kept
 * for a few minutes, and the names of the universities and organizations a profile names by id. Moved here from the
 * RSVP dashboard so each dashboard reads profiles the same way. Each module that provides it keeps its own profiles.
 */
@Injectable()
export class DashboardProfilesService {
  private readonly profiles = new Map<string, { profile: Auth0UserProfile | null; at: number }>();

  constructor(
    @InjectRepository(University) private readonly universityRepo: Repository<University>,
    @InjectRepository(Organization) private readonly organizationRepo: Repository<Organization>,
    private readonly ms: ManagementService
  ) {}

  /**
   * Each account's profile, read by searching for many at once (ManagementService.getUsersByIds). An account with no
   * profile (deleted, or in another tenant, as every account in the local copy is) is null, which counts as Not given.
   * If Auth0 cannot be asked at all (management not configured, as locally without credentials), every account is null
   * and nothing is kept, so the next load asks again.
   */
  public async profilesOf(accountGuids: Array<string>): Promise<Map<string, Auth0UserProfile | null>> {
    const accounts = [...new Set(accountGuids.filter(Boolean))];
    const result = new Map<string, Auth0UserProfile | null>();
    const now = Date.now();

    const toRead = accounts.filter((a) => {
      const kept = this.profiles.get(a);

      if (kept && now - kept.at < PROFILE_KEPT_MS) {
        result.set(a, kept.profile);

        return false;
      }

      return true;
    });

    if (toRead.length === 0) {
      return result;
    }

    let found: Map<string, Auth0UserProfile>;

    try {
      found = await this.ms.getUsersByIds(toRead);
    } catch (err) {
      Logger.warn(`Could not read ${toRead.length} accounts' profiles: ${err?.message}`, 'DashboardProfilesService');
      toRead.forEach((a) => result.set(a, null));

      return result;
    }

    for (const account of toRead) {
      const profile = found.get(account) ?? null;

      result.set(account, profile);
      this.profiles.set(account, { profile, at: now });
    }

    return result;
  }

  /** University and organization names by id: a profile stores its institution or employer as one of these. */
  public async organizationNames(): Promise<Map<string, string>> {
    const [universities, organizations] = await Promise.all([this.universityRepo.find(), this.organizationRepo.find()]);

    return new Map([...universities, ...organizations].map((o) => [o.guid, o.name]));
  }
}
