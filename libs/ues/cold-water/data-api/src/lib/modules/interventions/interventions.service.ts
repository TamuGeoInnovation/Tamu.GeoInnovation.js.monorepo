import { Injectable, HttpService, Inject, HttpException, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import * as FormData from 'form-data';

@Injectable()
export class InterventionsService {
  constructor(@Inject('RESOURCE_URL') private url: string, private http: HttpService) {}

  public getAllInterventions(): Observable<Array<ValveIntervention>> {
    return this.http
      .get(`${this.url}/query`, {
        params: {
          where: '1=1',
          outFields: '*',
          f: 'pjson'
        }
      })
      .pipe(pluck('data', 'features'));
  }

  public getIntervention(id: string): Observable<ValveIntervention> {
    return this.http
      .get(`${this.url}/query`, {
        params: {
          where: `OBJECTID = ${id}`,
          outFields: '*',
          f: 'pjson'
        }
      })
      .pipe(
        pluck('data', 'features', '0'),
        map((result) => {
          if (result) {
            return result;
          } else {
            throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
          }
        })
      );
  }

  public getAllInterventionsForValveId(valveId: string) {
    return this.http
      .get(`${this.url}/query`, {
        params: {
          where: `ValveNumber = ${valveId}`,
          outFields: '*',
          f: 'pjson'
        }
      })
      .pipe(
        pluck('data', 'features'),
        map((features) => {
          if (features && features.length > 0) {
            return features;
          } else {
            throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
          }
        })
      );
  }

  public insertIntervention(attributes: ValveInterventionAttributes) {
    return this.applyInterventionEdits('add', attributes);
  }

  public updateIntervention(attributes: ValveInterventionAttributes) {
    return this.applyInterventionEdits('update', attributes);
  }

  public deleteIntervention(attributes: Partial<ValveInterventionAttributes>) {
    return this.applyInterventionEdits('delete', attributes);
  }

  private applyInterventionEdits(type: 'add' | 'update' | 'delete', attributes: Partial<ValveInterventionAttributes>) {
    const form = new FormData();
    form.append('f', 'pjson');

    if (type === 'add') {
      form.append('adds', JSON.stringify([{ attributes: attributes }]));
    } else if (type === 'update') {
      form.append('updates', JSON.stringify([{ attributes: attributes }]));
    } else if (type === 'delete') {
      form.append('deletes', JSON.stringify([attributes.OBJECTID]));
    } else {
      throw new UnprocessableEntityException();
    }

    return this.http
      .post(`${this.url}/applyEdits`, form, {
        headers: form.getHeaders()
      })
      .pipe(
        pluck('data'),
        catchError((err) => {
          throw new HttpException(`Internal server error: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      );
  }
}

export interface ValveIntervention {
  attributes: ValveInterventionAttributes;
}

export interface ValveInterventionAttributes {
  OBJECTID: number;
  ValveNumber: number;
  SubmittedBy: string;
  Date: Date;
  OperatorName: string;
  LocationDescription: string;
  Reason: string;
  AffectedBuildings: string;
  EstimatedRestoration: Date;
  YellowLidPlaced: string;
  LockoutTagePlaced: string;
  DoesMapNeedUpdate: string;
  WorkOrder: string;
}
