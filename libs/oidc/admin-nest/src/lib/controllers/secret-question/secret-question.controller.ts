import { Controller, Post, Req, Get, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { urlFragment, urlHas } from '../../_utils/url-utils';

@Controller('secret-question')
export class SecretQuestionController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async insertSecretQuestionPost(@Req() req: Request) {
    return this.userService.insertSecretQuestion(req);
  }

  @Get()
  async secretQuestionsGet() {
    return this.userService.getAllSecretQuestions();
  }
}
