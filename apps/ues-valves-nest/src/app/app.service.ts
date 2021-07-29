import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AppService {
  public getData(): { message: string } {
    return new NotImplementedException();
  }
}
