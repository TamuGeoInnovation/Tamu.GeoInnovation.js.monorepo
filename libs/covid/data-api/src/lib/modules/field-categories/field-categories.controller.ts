import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { FieldCategory } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesService } from './field-categories.service';

@Controller('field-categories')
export class FieldCategoriesController extends BaseController<FieldCategory> {
  constructor(private service: FieldCategoriesService) {
    super(service);
  }

  @Get('types/:id')
  public getFieldTypesForCategory(@Param() params) {
    return this.service.getFieldTypesForCategory(params.id);
  }

  @Post(':id/types')
  public addFieldTypeToCategory(@Body() body, @Param() params) {
    return this.service.addFieldTypeToCategory(params.id, body.type);
  }

  @Get(':id/values')
  public getCategoryValues(@Param() params) {
    return this.service.getCategoryWithValues(params.id);
  }

  @Post(':id/values')
  public addValueToType(@Param() params, @Body() body) {
    return this.service.addValueToCategory(params.id, body.value);
  }

  @Get('')
  public getCategories() {
    return this.service.getAllCategoriesWithTypes();
  }

  @Delete('')
  public deleteCategory() {
    return {
      status: 501,
      success: false,
      message: 'Not implemented'
    };
  }
}
