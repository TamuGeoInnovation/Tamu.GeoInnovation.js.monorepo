import { DynamicModule, HttpModule, Module } from '@nestjs/common';

import { InterventionsController } from './interventions.controller';
import { InterventionsService } from './interventions.service';

@Module({ imports: [HttpModule], controllers: [InterventionsController], providers: [InterventionsService] })
export class InterventionModule {
  public static forRoot(featureTableUrl: string): DynamicModule {
    return {
      module: InterventionModule,
      providers: [
        {
          provide: 'RESOURCE_URL',
          useValue: featureTableUrl
        }
      ]
    };
  }
}
