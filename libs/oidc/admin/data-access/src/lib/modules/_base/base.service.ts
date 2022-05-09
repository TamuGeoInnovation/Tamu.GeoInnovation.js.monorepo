import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private route: string) {
    this.resource = this.env.value('api_url') + `/${route}`;
  }

  public getEntity(guid?: string) {
    return this.http.get<Partial<T>>(`${this.resource}/${guid}`);
  }

  public getEntities() {
    return this.http.get<Array<Partial<T>>>(`${this.resource}`);
  }
}

