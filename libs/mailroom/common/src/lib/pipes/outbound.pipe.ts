import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class OutboundPipe implements PipeTransform {
  public transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
