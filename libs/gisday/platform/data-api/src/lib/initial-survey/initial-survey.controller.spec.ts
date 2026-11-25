import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { InitialSurveyController } from './initial-survey.controller';
import { InitialSurveyProvider } from './initial-survey.provider';

// #3495: a question sent without its question type answered 500, reading the type's guid from nothing.
describe('InitialSurveyController questions', () => {
  let app: INestApplication;
  let url: string;
  const insertQuestion = jest.fn(async () => ({ guid: 'q-1' }));

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [InitialSurveyController],
      providers: [{ provide: InitialSurveyProvider, useValue: { insertQuestion } }]
    }).compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    insertQuestion.mockClear();
  });

  const post = (body: object) =>
    fetch(`${url}/initial-surveys/questions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });

  it('refuses a question with no question type, with 400', async () => {
    const response = await post({ questionText: 'Which year are you?' });

    expect(response.status).toBe(400);
    expect(insertQuestion).not.toHaveBeenCalled();
  });

  it('adds a question of the type named', async () => {
    const response = await post({ questionText: 'Which year are you?', questionType: { guid: 'type-1' } });

    expect(response.status).toBe(201);
    expect(insertQuestion).toHaveBeenCalledWith('type-1', expect.objectContaining({ questionText: 'Which year are you?' }));
  });
});
