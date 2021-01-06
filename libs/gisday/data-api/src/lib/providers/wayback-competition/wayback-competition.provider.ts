import { Injectable } from '@nestjs/common';

import {
  SignageSubmissionRepo,
  StormwaterSubmissionRepo,
  SidewalkSubmissionRepo,
  ManholeSubmissionRepo
} from '../../entities/all.entity';

@Injectable()
export class WaybackCompetitionProvider {
  constructor(
    private readonly signageRepo: SignageSubmissionRepo,
    private readonly stormwaterRepo: StormwaterSubmissionRepo,
    private readonly sidewalkRepo: SidewalkSubmissionRepo,
    private readonly manholeRepo: ManholeSubmissionRepo
  ) {}

  public async getSignageSubmissions() {
    return this.signageRepo.find();
  }

  public async getStormwaterSubmissions() {
    return this.stormwaterRepo.find();
  }

  public async getSidewalkSubmissions() {
    return this.sidewalkRepo.find();
  }

  public async getManholeSubmissions() {
    return this.manholeRepo.find();
  }
}
