import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import got from 'got';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { ContactService } from './contact.service';

jest.mock('got');

describe('ContactService', () => {
  let service: ContactService;
  let post: jest.Mock;

  /** The env values the service is supposed to fall back to. */
  const ENV = {
    MAILROOM_URL: 'https://mailroom.example.edu/send',
    MAILROOM_TO: 'gisday@tamu.edu',
    MAILROOM_FROM: 'noreply@tamu.edu',
    MAILROOM_BCC: 'archive@tamu.edu',
    MAILROOM_CC: 'cc@tamu.edu'
  };

  /** `IMailroomEmailOutbound` requires subject, text, to and from; overrides go on top. */
  const message = (over: Partial<IMailroomEmailOutbound> = {}): IMailroomEmailOutbound =>
    ({
      subject: 'Hello',
      text: 'Message body',
      to: 'placeholder@example.com',
      from: 'placeholder@example.com',
      ...over
    }) as IMailroomEmailOutbound;

  /** What the composed payload ended up being, read off the mocked transport. */
  const sentPayload = () => post.mock.calls[0][1].json as IMailroomEmailOutbound;

  const original = { ...process.env };

  beforeEach(async () => {
    Object.assign(process.env, ENV);

    post = jest.fn().mockReturnValue({ json: jest.fn().mockResolvedValue({ ok: true }) });
    (got as unknown as { post: jest.Mock }).post = post;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService]
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    process.env = { ...original };
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * The `systemCall` flag is the only thing standing between a public contact form and an open
   * relay. Without it, whoever posts the form chooses their own `to`, `cc` and `bcc` and the
   * service delivers on their behalf from a tamu.edu address.
   *
   * These assert that an ordinary caller cannot influence any recipient field, whatever they send.
   */
  describe('recipient handling for a public submission', () => {
    it('ignores caller-supplied recipients entirely', async () => {
      await service.sendMessage(
        message({
          to: 'attacker@example.com',
          from: 'victim@example.com',
          cc: 'cc-attacker@example.com',
          bcc: 'bcc-attacker@example.com'
        })
      );

      const sent = sentPayload();

      expect(sent.to).toBe(ENV.MAILROOM_TO);
      expect(sent.cc).toBe(ENV.MAILROOM_CC);
      expect(sent.bcc).toBe(ENV.MAILROOM_BCC);
      expect(sent.from).toBe(ENV.MAILROOM_FROM);
    });

    it('keeps the submitter as replyTo so the reply reaches them', async () => {
      await service.sendMessage(message({ from: 'student@tamu.edu' }));

      // `from` is replaced with the system address, but the original sender is preserved here so
      // answering the message goes to the person who filled the form.
      expect(sentPayload().replyTo).toBe('student@tamu.edu');
      expect(sentPayload().from).toBe(ENV.MAILROOM_FROM);
    });

    it('preserves the parts of the message that are not recipients', async () => {
      await service.sendMessage(
        message({ subject: 'Question about GIS Day', text: 'When does it start?' })
      );

      expect(sentPayload()).toEqual(
        expect.objectContaining({
          subject: 'Question about GIS Day',
          text: 'When does it start?'
        })
      );
    });
  });

  describe('recipient handling for a system call', () => {
    it('honours supplied recipients', async () => {
      await service.sendMessage(
        message({
          subject: 'Receipt',
          to: 'registrant@tamu.edu',
          from: 'gisday@tamu.edu',
          cc: 'organizer@tamu.edu',
          bcc: 'audit@tamu.edu'
        }),
        true
      );

      const sent = sentPayload();

      expect(sent.to).toBe('registrant@tamu.edu');
      expect(sent.cc).toBe('organizer@tamu.edu');
      expect(sent.bcc).toBe('audit@tamu.edu');
    });

    it('still falls back to the configured address for any field left out', async () => {
      await service.sendMessage(
        message({ subject: 'Receipt', to: 'registrant@tamu.edu', from: undefined }),
        true
      );

      const sent = sentPayload();

      expect(sent.to).toBe('registrant@tamu.edu');
      expect(sent.from).toBe(ENV.MAILROOM_FROM);
      expect(sent.cc).toBe(ENV.MAILROOM_CC);
    });
  });

  describe('transport', () => {
    it('posts to the configured mailroom URL', async () => {
      await service.sendMessage(message());

      expect(post).toHaveBeenCalledWith(ENV.MAILROOM_URL, expect.objectContaining({ json: expect.any(Object) }));
    });

    it('does not mutate the message it was handed', async () => {
      const handed = message({ to: 'caller@example.com' });

      await service.sendMessage(handed);

      expect(handed.to).toBe('caller@example.com');
    });

    it('reports a transport failure as 500', async () => {
      post.mockReturnValue({ json: jest.fn().mockRejectedValue(new Error('mailroom unreachable')) });

      await expect(service.sendMessage(message())).rejects.toThrow(InternalServerErrorException);
    });
  });
});
