import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';

import { AppMetadata, ManagementClient, User, UserMetadata } from 'auth0';
import { reduce } from 'rxjs';

export const MANAGEMENT_CONFIG = 'MANAGEMENT_CONFIG';

@Injectable()
export class ManagementService {
  private _client: ManagementClient;

  constructor(@Inject(MANAGEMENT_CONFIG) private readonly config: ManagementConfig) {
    this._initManagement();
  }

  private _initManagement() {
    Logger.log('Initializing Auth0 management client...', 'ManagementService');

    if (!this.config.domain || !this.config.clientId || !this.config.clientSecret) {
      throw new Error('Management service configuration is missing required parameters.');
    }

    this._client = new ManagementClient({
      domain: this.config.domain,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret
    });
  }

  public async getUserMetadata(userId: string, filters?: Auth0UserProfileFilters): Promise<Auth0UserProfile> {
    try {
      const user = await this._client.getUser({ id: userId });

      if (!user) {
        throw new NotFoundException();
      }

      return this._composeMetadata(user, filters);
    } catch (err) {
      Logger.error(err.message, 'ManagementService');
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Updates user metadata for a given user.
   *
   * @param {string} userId  The Auth0 user ID
   * @param {Auth0UserProfile} info The user metadata to update. This includes root level properties as well as app_metadata and user_metadata.
   * @param {Auth0UserProfileFilters} filters Defines and limits which properties can be updated. This serves as a safety mechanism to prevent unwanted updates to other application metadata or user grouping properties.
   */
  public async updateUserMetadata(userId: string, info: Auth0UserProfile, filters: Auth0UserProfileFilters) {
    const user = await this._client.getUser({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    try {
      const pruned = this._removeFalsyValues(info);
      const payload = {};

      if (pruned.user_info) {
        const composedInfo = this._composeUserInfo(user, pruned.user_info);
        Object.assign(payload, composedInfo);
      }

      if (pruned.app_metadata) {
        const filteredAppMetadata = this._filterMetadata(pruned.app_metadata, filters.app_metadata);

        if (filteredAppMetadata) {
          Object.assign(payload, { app_metadata: filteredAppMetadata });
        }
      }

      if (pruned.user_metadata) {
        const filteredUserMetadata = this._filterMetadata(pruned.user_metadata, filters.user_metadata);

        if (filteredUserMetadata) {
          Object.assign(payload, { user_metadata: filteredUserMetadata });
        }
      }

      const updatedMetadata = await this._client.updateUser({ id: userId }, payload);

      return this._composeMetadata(updatedMetadata, filters);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  /**
   * Creates root level user info properties that match those of the Auth0 user object.
   */
  private _composeUserInfo(original: User, updated: Auth0UserProfile['user_info']) {
    const shallow = { ...updated };

    // Because name and email are managed by the social integration, we don't want to overwrite them
    if (this._isSocialUser(original.user_id)) {
      delete shallow.given_name;
      delete shallow.family_name;
      delete shallow.email;
    } else {
      // Do not update email otherwise the session will be invalidated
      delete shallow.email;
    }

    // Compose a full name from given and family names, if they exist
    if (shallow.family_name !== undefined && shallow.given_name !== undefined) {
      shallow.name = `${shallow.given_name} ${shallow.family_name}`;
    }

    // These are precomputed values derived from other properties for convenience
    // They should not be updated directly
    delete shallow.connection;
    delete shallow.social;

    if (Object.keys(shallow).length === 0) {
      return undefined;
    } else {
      return shallow;
    }
  }

  /**
   * Given an object of n-th depth, remove all properties that are falsy
   * Falsy values are: null, undefined, and "" (empty string)
   * Return a new object with the same structure, but without the falsy values
   */
  private _removeFalsyValues(obj: Auth0UserProfile): Partial<Auth0UserProfile> {
    const newObj = Object.entries(obj).reduce((acc, [key, value]) => {
      if (value && typeof value === 'object' && Object.keys(obj).length > 0) {
        acc[key] = this._removeFalsyValues(value);
      } else if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }

      return acc;
    }, {});

    return newObj;
  }

  /**
   * Accepts an app or user metadata object and filters the root level properties based on the provided filter.
   */
  private _filterMetadata(obj: AppMetadata | UserMetadata, filter: MetadataFilters): Partial<Auth0UserProfile> {
    if (filter === '*') {
      if (Object.keys(obj).length > 0) {
        return obj;
      } else {
        return undefined;
      }
    }

    if (typeof filter === 'string') {
      if (obj[filter]) {
        return {
          [filter]: obj[filter]
        };
      } else {
        return undefined;
      }
    }

    if (filter instanceof Array) {
      const reduced = Object.entries(obj).reduce((acc, [key, value]) => {
        if (filter.includes(key) || filter.includes('*')) {
          acc[key] = value;
        }

        return acc;
      }, {});

      if (Object.keys(reduce).length > 0) {
        return reduced;
      } else {
        return undefined;
      }
    }
  }

  private _isSocialUser(userId: string) {
    return userId.split('|')[0] !== 'auth0';
  }

  private _composeMetadata(user: User, filters: Auth0UserProfileFilters): Auth0UserProfile {
    return {
      user_info: {
        name: user.name || null,
        given_name: user.given_name || null,
        family_name: user.family_name || null,
        email: user.email || null,
        connection: user.user_id.split('|')[0],
        social: this._isSocialUser(user.user_id)
      },
      user_metadata: user.user_metadata
        ? filters
          ? this._filterMetadata(user.user_metadata, filters.user_metadata)
          : user.user_metadata
        : {},
      app_metadata: user.app_metadata
        ? filters
          ? this._filterMetadata(user.app_metadata, filters.app_metadata)
          : user.app_metadata
        : {}
    };
  }
}

export interface ManagementConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
}

export interface Auth0UserProfile {
  user_metadata: UserMetadata;
  app_metadata: AppMetadata;
  user_info: {
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    connection: string;
    social: boolean;
  };
}

export interface Auth0UserProfileFilters {
  /**
   * Defines which user app metadata properties can be updated.
   *
   * Auth0 merges app metadata root properties with the existing app metadata object. If an object is provided and empty, Auth0 will remove all app metadata properties.
   *
   * Since client applications don't necessarily validate or limit which properties make it into a payload, this serves as a safety mechanism to prevent unwanted updates to other application metadata.
   *
   * @example `*`: (all properties) Update all app metadata properties as provided
   * @example `['gisday', 'geoservices]`:  Only update the gisday and geoservices application metadata properties
   * @example `gisday`:  Only update the gisday application metadata property
   */
  app_metadata: MetadataFilters;

  /**
   * Defines which user metadata properties can be updated.
   *
   * Auth0 merges user metadata root properties with the existing user metadata object. If an object is provided and empty, Auth0 will remove all user metadata properties.
   *
   * Since client applications don't necessarily validate or limit which properties make it into a payload, this serves as a safety mechanism to prevent unwanted updates to other user metadata properties.
   *
   * @example `*`: (all properties) Update all user metadata properties as provided
   * @example `['education', 'occupation]`:  Only update the education and occupation user metadata properties
   * @example `education`:  Only update the education user metadata property
   */
  user_metadata: MetadataFilters;
}

type MetadataFilters = '*' | string | Array<string>;
