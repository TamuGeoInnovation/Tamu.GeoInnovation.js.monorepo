import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OldCompetitionEntity } from '../../entities/all.entity';

@Injectable()
export class GeoJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
  properties: {};
}
