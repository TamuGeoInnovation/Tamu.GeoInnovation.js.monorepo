import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, ScenariosModule, ResponsesModule } from '@tamu-gisc/cpa/data-api';

/*import { config } from '../environments/ormconfig';*/

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '.',
      port: 1433,
      username: 'test',
      password: 'test',
      database: 'master',
      entities: ['./**/*.entity.ts'],
      synchronize: false
    }),
    WorkshopsModule,
    ScenariosModule,
    ResponsesModule
  ]
})
export class AppModule {}
