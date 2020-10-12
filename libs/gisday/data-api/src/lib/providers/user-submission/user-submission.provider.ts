import { Injectable, Req } from '@nestjs/common';
import { Request } from 'express';

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

  public async insertUserSubmission(@Req() req: Request) {
    const submissionType = await this.submissionTypeRepo.findOne({
      where: {
        guid: req.body.submissionType
      }
    });
    if (submissionType) {
      const _userSubmission: Partial<UserSubmission> = req.body;
      _userSubmission.accountGuid = req.user.sub;
      _userSubmission.submissionType = submissionType;
      const userSubmission = this.userSubmissionRepo.create(_userSubmission);
      return this.userSubmissionRepo.save(userSubmission);
    }
  }
}
