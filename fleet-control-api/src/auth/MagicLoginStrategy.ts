import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import 'dotenv/config';
import { AuthService } from 'src/services/AuthService';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(MagicLoginStrategy.name);
  constructor(
    private authService: AuthService,
    private mailService: MailerService,
  ) {
    super({
      secret: process.env.SECRET,
      jwtOptions: {
        expiresIn: '5m',
      },
      callbackUrl: 'http://localhost:8080/auth/login/callback',
      sendMagicLink: async (destination, href) => {
        await this.mailService.sendMail({
          to: destination,
          from: 'fleetcontrolspeed@gmail.com',
          subject: 'Magic Link',
          text: `Magic Link: ${href}`,
        });
        this.logger.debug(`sending email to ${destination} with link ${href}`);
      },
      verify: async (payload, callback) =>
        callback(null, this.validate(payload)),
    });
  }
  validate(payload: { destination: string }) {
    const user = this.authService.validateUser(payload.destination);

    return user;
  }
}
