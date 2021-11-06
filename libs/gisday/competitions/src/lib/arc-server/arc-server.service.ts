import { HttpService, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

@Injectable()
export class ArcServerService {
  // TODO: Have service URL come from environment file? - Aaron H
  private serviceUrl = 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/41?f=pjson';

  constructor(private httpService: HttpService) {}

  public getService(): Observable<AxiosResponse<any>> {
    return this.httpService.get(this.serviceUrl).pipe(pluck('fields')); //pluck('fields')
  }
}
