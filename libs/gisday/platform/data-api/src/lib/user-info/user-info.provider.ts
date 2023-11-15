import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AppMetadata, UserMetadata } from 'auth0';

import { Auth0UserProfile, ManagementService } from '@tamu-gisc/common/nest/auth';

import { Organization, University, UserInfo } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserInfoProvider extends BaseProvider<UserInfo> {
  constructor(
    @InjectRepository(UserInfo) private userInfoRepo: Repository<UserInfo>,
    @InjectRepository(University) private universityRepo: Repository<University>,
    @InjectRepository(Organization) private organizationRepo: Repository<Organization>,
    private readonly ms: ManagementService
  ) {
    super(userInfoRepo);
  }

  public async getUsers() {
    return this.ms.getUsers({
      app_metadata: 'gisday',
      user_metadata: ['occupation', 'education']
    });
  }

  public async getUser(userGuid: string) {
    throw new NotImplementedException('service: get user');
  }

  public async getUserMetadata(guid: string) {
    return this.ms.getUserMetadata(guid, {
      app_metadata: 'gisday',
      user_metadata: ['occupation', 'education']
    });
  }

  public async updateUserMetadata(guid: string, updatedUserInfo: GisDayAppMetadata) {
    // Validate that the user metadata is complete based on the user's participant type.

    if (!updatedUserInfo || !updatedUserInfo.app_metadata || !updatedUserInfo.user_metadata) {
      throw new UnprocessableEntityException('User metadata is incomplete.');
    }

    if (!updatedUserInfo.app_metadata.gisday.attendeeType) {
      throw new UnprocessableEntityException('User metadata (gisday) is incomplete.');
    }

    //
    // Validate student.
    //
    if (updatedUserInfo.app_metadata.gisday.attendeeType === ParticipantType.Student) {
      if (
        !updatedUserInfo.user_metadata.education.id ||
        !updatedUserInfo.user_metadata.education.fieldOfStudy ||
        !updatedUserInfo.user_metadata.education.classification
      ) {
        throw new UnprocessableEntityException('User metadata (education) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.education.institution === 'other' &&
        !updatedUserInfo.user_metadata.education.otherInstitution
      ) {
        throw new UnprocessableEntityException('User metadata (education, other institution) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.education.institution === 'other' &&
        updatedUserInfo.user_metadata.education.otherInstitution
      ) {
        const university = await this._resolveOrCreateUniversity(updatedUserInfo.user_metadata.education.otherInstitution);

        updatedUserInfo.user_metadata.education.institution = university.guid;
      }
    }

    //
    // Validate academia. Uses the same object as industry but the employer is a university.
    //
    if (updatedUserInfo.app_metadata.gisday.attendeeType === ParticipantType.Academia) {
      if (
        !updatedUserInfo.user_metadata.occupation.employer ||
        !updatedUserInfo.user_metadata.occupation.department ||
        !updatedUserInfo.user_metadata.occupation.position
      ) {
        throw new UnprocessableEntityException('User metadata (academia) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.occupation.employer === 'other' &&
        !updatedUserInfo.user_metadata.occupation.otherEmployer
      ) {
        throw new UnprocessableEntityException('User metadata (academia, other employer) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.occupation.employer === 'other' &&
        updatedUserInfo.user_metadata.occupation.otherEmployer
      ) {
        const university = await this._resolveOrCreateUniversity(updatedUserInfo.user_metadata.occupation.otherEmployer);

        updatedUserInfo.user_metadata.occupation.employer = university.guid;
      }
    }

    //
    // Validate industry. Uses the same object as academia but the employer is an organization.
    //
    if (updatedUserInfo.app_metadata.gisday.attendeeType === ParticipantType.Industry) {
      if (
        !updatedUserInfo.user_metadata.occupation.employer ||
        !updatedUserInfo.user_metadata.occupation.department ||
        !updatedUserInfo.user_metadata.occupation.position
      ) {
        throw new UnprocessableEntityException('User metadata (industry) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.occupation.employer === 'other' &&
        !updatedUserInfo.user_metadata.occupation.otherEmployer
      ) {
        throw new UnprocessableEntityException('User metadata (industry, other employer) is incomplete.');
      }

      if (
        updatedUserInfo.user_metadata.occupation.employer === 'other' &&
        updatedUserInfo.user_metadata.occupation.otherEmployer
      ) {
        const organization = await this._resolveOrCreateOrganization(updatedUserInfo.user_metadata.occupation.otherEmployer);
        updatedUserInfo.user_metadata.occupation.employer = organization.guid;
      }
    }

    updatedUserInfo.app_metadata.gisday.completedProfile = true;

    return this.ms.updateUserMetadata(guid, updatedUserInfo, {
      app_metadata: 'gisday',
      user_metadata: ['occupation', 'education']
    });
  }

  private async _resolveOrCreateUniversity(name: string) {
    try {
      if (!name) {
        throw new Error('University name is undefined.');
      }

      const institution = await this.universityRepo.findOne({
        where: {
          name: name
        }
      });

      if (!institution) {
        const nu = this.universityRepo.create({
          name: name
        });

        return await this.universityRepo.save(nu);
      }

      return institution;
    } catch (err) {
      throw new InternalServerErrorException('Error resolving university.');
    }
  }

  private async _resolveOrCreateOrganization(name: string) {
    try {
      if (!name) {
        throw new Error('Organization name is undefined.');
      }
      const organization = await this.organizationRepo.findOne({
        where: {
          name: name
        }
      });

      if (!organization) {
        const no = this.organizationRepo.create({
          name: name
        });

        return await this.organizationRepo.save(no);
      }

      return organization;
    } catch (err) {
      throw new InternalServerErrorException('Error resolving organization.');
    }
  }
}

export interface GisDayAppMetadata extends Auth0UserProfile {
  app_metadata: AppMetadata & {
    gisday: {
      attendeeType: ParticipantType;
      completedProfile: boolean;
    };
  };
  user_metadata: UserMetadata & {
    education: {
      id: string;
      institution: string;
      otherInstitution: string;
      fieldOfStudy: string;
      classification: string;
    };
    occupation: {
      employer: string;
      otherEmployer: string;
      department: string;
      position: string;
    };
  };
}

export enum ParticipantType {
  Student = 'student',
  Industry = 'industry',
  Academia = 'academia'
}

