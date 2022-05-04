import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { map } from 'rxjs/operators';

import { ValidObject } from '@tamu-gisc/oidc/common';

import { OldCompetitionEntity } from '../../entities/all.entity';

@Injectable()
export class GeoJsonInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((returnData) => {
        const features: IGeoJsonFeature[] = [];
        returnData.forEach((entity: OldCompetitionEntity) => {
          features.push(entity.geoJsonRepresentation());
        });
        return {
          type: 'FeatureCollection',
          features: features
        };
      })
    );
  }
}

export interface IGeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: ValidObject;
}
