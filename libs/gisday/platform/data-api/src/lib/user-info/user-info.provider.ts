import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AppMetadata, UserMetadata } from 'auth0';

import { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { UserInfo } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserInfoProvider extends BaseProvider<UserInfo> {
  constructor(
    @InjectRepository(UserInfo) private userInfoRepo: Repository<UserInfo>,
    private readonly ms: ManagementService
  ) {
    super(userInfoRepo);
  }

  public async getUsersInfo(guid: string) {
    return this.ms.getUserMetadata(guid, {
      app_metadata: 'gisday',
      user_metadata: '*'
    });
  }

  public updateUserInfo(guid: string, updatedUserInfo: GisDayAppMetadata) {
    return this.ms.updateUserMetadata(guid, updatedUserInfo, {
      app_metadata: 'gisday',
      user_metadata: '*'
    });
  }
}

export interface GisDayAppMetadata extends Auth0UserProfile {
  app_metadata: AppMetadata & {
    gisday: {
      attendeeType: string;
      completedProfile: boolean;
    };
  };
  user_metadata: UserMetadata & {
    uin: string;
    fieldOfStudy: string;
    classification: string;
  };
}
