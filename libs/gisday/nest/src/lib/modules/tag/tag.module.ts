import { Module } from '@nestjs/common';
import { TagController } from '../../controllers/tag/tag.controller';
import { TagProvider } from '../../providers/tag/tag.provider';

@Module({
  imports: [],
  controllers: [TagController],
  providers: [TagProvider],
  exports: []
})
export class TagModule {}
