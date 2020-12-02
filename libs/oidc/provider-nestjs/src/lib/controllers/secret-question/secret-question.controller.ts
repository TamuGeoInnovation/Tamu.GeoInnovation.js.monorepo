import { Controller, Post, Get, Body } from '@nestjs/common';

import { SecretQuestion, UserService } from '@tamu-gisc/oidc/common';

@Controller('secret-question')
export class SecretQuestionController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public async secretQuestionsGet() {
    return this.userService.getAllSecretQuestions();
  }

  @Post()
  public async insertSecretQuestionPost(@Body() body) {
    const questions: Partial<SecretQuestion>[] = [];

    body.questions.map((value) => {
      const question: Partial<SecretQuestion> = {
        questionText: value.questionText
      };
      questions.push(question);
    });

    return this.userService.insertSecretQuestion(questions);
  }
}
