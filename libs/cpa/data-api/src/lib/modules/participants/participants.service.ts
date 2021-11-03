import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import { Participant } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from '../workshops/workshops.service';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant) private readonly repo: Repository<Participant>,
    private readonly ws: WorkshopsService
  ) {}

  public async getParticipantsForWorkshop(dto: GetParticipantsForWorkshopDto) {
    const workshop = await this.ws.getWorkshop(dto.workshopGuid, false, false, false, true);

    const qb = this.repo
      .createQueryBuilder('participant')
      .leftJoin('participant.workshops', 'workshop')
      .where('workshop.guid = :workshopGuid')
      .orWhere('workshop.alias = :workshopAlias')
      .setParameters({ workshopGuid: dto.workshopGuid, workshopAlias: workshop.alias })
      .getMany();

    return qb;
  }

  public async createParticipantForWorkshop(dto: CreateParticipantForWorkshopDto) {
    const workshop = await this.ws.getWorkshop(dto.workshopGuid, false, false, false, true);

    const created = this.repo.create({
      name: dto.name,
      workshops: [workshop]
    });

    return created.save();
  }

  public async updateParticipant(dto: UpdateParticipantDto) {
    const existingParticipant = await this.repo.findOne({
      guid: dto.participantGuid
    });

    if (!existingParticipant) {
      throw new NotFoundException();
    }

    existingParticipant.name = dto.name;

    return existingParticipant.save();
  }

  public async deleteParticipant(dto: DeleteParticipantDto) {
    const existingParticipant = await this.repo.findOne({
      where: {
        guid: dto.participantGuid
      }
    });

    if (!existingParticipant) {
      throw new NotFoundException();
    }

    return existingParticipant.remove();
  }
}

export class GetParticipantsForWorkshopDto {
  @IsNotEmpty()
  public workshopGuid: string;
}

export class CreateParticipantForWorkshopDto {
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public workshopGuid: string;
}

export class UpdateParticipantDto {
  @IsNotEmpty()
  public participantGuid: string;

  @IsNotEmpty()
  public name: string;
}

export class DeleteParticipantDto {
  @IsNotEmpty()
  public participantGuid: string;
}
