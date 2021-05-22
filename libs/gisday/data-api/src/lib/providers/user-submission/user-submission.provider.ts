import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { SubmissionTypeRepo, UserSubmission, UserSubmissionRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class UserSubmissionProvider extends BaseProvider<UserSubmission> {
  constructor(
    public readonly userSubmissionRepo: UserSubmissionRepo,
    public readonly submissionTypeRepo: SubmissionTypeRepo
  ) {
    super(userSubmissionRepo);
  }

  public async insertUserSubmission(accountGuid: string, _userSubmission: Partial<UserSubmission>) {
    const submissionType = await this.submissionTypeRepo.findOne({
      where: {
        guid: _userSubmission.submissionType
      }
    });
    if (submissionType) {
      _userSubmission.accountGuid = accountGuid;
      _userSubmission.submissionType = submissionType;
      const userSubmission = this.userSubmissionRepo.create(_userSubmission);
      return this.userSubmissionRepo.save(userSubmission);
    } else {
      throw new HttpException('Could not find submission type', HttpStatus.PARTIAL_CONTENT);
    }
  }
}
