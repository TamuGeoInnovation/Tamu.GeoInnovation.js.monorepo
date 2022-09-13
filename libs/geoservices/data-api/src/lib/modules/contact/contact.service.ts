import { Injectable } from '@nestjs/common';

import { IsEmail, IsNotEmpty } from 'class-validator';
@Injectable()
export class ContactService {}

export class ContactMessageDto {
  @IsEmail()
  public from: string;

  @IsNotEmpty()
  public subject: string;

  @IsNotEmpty()
  public body: string;
}
