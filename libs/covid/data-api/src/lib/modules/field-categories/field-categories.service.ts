import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class FieldCategoriesService extends BaseService<FieldCategory> {
  constructor(
    @InjectRepository(FieldCategory) private repo: Repository<FieldCategory>,
    @InjectRepository(FieldType) private typeRepo: Repository<FieldType>,
    @InjectRepository(CategoryValue) private valueRepo: Repository<CategoryValue>
  ) {
    super(repo);
  }

  public async getAllCategoriesWithTypes() {
    return this.repo.find({ relations: ['types'] });
  }

  public async getCategoryWithValues(id: string) {
    return this.repo.find({
      where: {
        id: id
      },
      relations: ['values']
    });
  }

  public async getFieldTypesForCategory(categoryId: number) {
    if (categoryId === undefined) {
      return {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
    }

    const category = await this.repo.findOne({ where: { id: categoryId } });

    if (!category) {
      return {
        status: 400,
        success: false,
        message: 'Invalid category ID.'
      };
    }

    return this.repo.findOne({
      where: {
        id: categoryId
      },
      relations: ['types']
    });
  }

  public async addFieldTypeToCategory(categoryId: number, typeGuid: string) {
    const category = await this.repo.findOne({
      where: {
        id: categoryId
      },
      relations: ['types', 'values']
    });

    if (!category) {
      return {
        status: 400,
        success: false,
        message: 'Invalid category.'
      };
    }

    const type = await this.typeRepo.findOne({ where: { guid: typeGuid } });

    if (!type) {
      return category;
    }

    if (category.types.findIndex((t) => t.guid === type.guid) === -1) {
      category.types.push(type);
    }

    return category.save();
  }

  public async addValueToCategory(categoryId: string, value: string) {
    const category = await this.repo.findOne({
      where: {
        id: categoryId
      }
    });

    if (!category) {
      return {
        status: 400,
        success: false,
        message: 'Invalid category.'
      };
    }

    const v = this.valueRepo.create({
      value: value,
      category: category
    });

    await v.save();

    return await this.repo.findOne({
      where: {
        guid: categoryId
      },
      relations: ['values']
    });
  }
}
