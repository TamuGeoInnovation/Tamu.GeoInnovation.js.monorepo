import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';

import { ManagementClient } from 'auth0';

export const MANAGEMENT_CONFIG = 'MANAGEMENT_CONFIG';

@Injectable()
export class ManagementService {
  private _userManager;
  private _client: ManagementClient;

  constructor(@Inject(MANAGEMENT_CONFIG) private readonly config: ManagementConfig) {
    this._initManagement();
  }

  private _initManagement() {
    Logger.log('ManagementService', 'Initializing management service...');

    if (!this.config.domain || !this.config.clientId || !this.config.clientSecret) {
      throw new Error('Management service configuration is missing required parameters.');
    }

    this._client = new ManagementClient({
      domain: this.config.domain,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret
    });
  }

  public async getUserMetadata(userId: string) {
    try {
      const user = await this._client.getUser({ id: userId });

      if (!user) {
        throw new NotFoundException();
      }

      return (
        user?.user_metadata || {
          guid: user.user_id
        }
      );
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  public async updateUserMetadata(userId: string, metadata: any) {
    try {
      const user = await this._client.getUser({ id: userId });

      if (!user) {
        throw new NotFoundException();
      }

      try {
        if (user?.app_metadata) {
          const merged = Object.assign(user.app_metadata, metadata);

          const updated = await this._client.updateUserMetadata({ id: userId }, merged);

          return updated;
        } else {
          const created = await this._client.updateUserMetadata({ id: userId }, metadata);

          return created;
        }
      } catch (err) {
        throw new UnprocessableEntityException(err.message);
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}

export interface ManagementConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
}
