import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public getData(): { message: string } {
    return { message: 'Welcome to ues-effluent-data-api-nest!' };
  }
}
