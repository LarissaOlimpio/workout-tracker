import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST') ?? 'localhost',
      port: Number(config.get<string>('SMTP_PORT') ?? 1025),
    });
  }

  sendPasswordReset(to: string, link: string) {
    const from =
      process.env.MAIL_FROM ?? 'Workout Tracker <no-reply@workout.local>';
    return this.transporter.sendMail({
      from,
      to,
      subject: 'Password reset',
      text: `Use this link to reset your password. It expires in 30 minutes:\n\n${link}`,
      html: `<p>Use this link to reset your password. It expires in 30 minutes:</p><p><a href="${link}">${link}</a></p>`,
    });
  }
}
