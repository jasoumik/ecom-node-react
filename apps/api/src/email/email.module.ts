import { Module, Global } from '@nestjs/common';
import { EmailProvider } from './email.provider';
import { BrevoEmailProvider } from './providers/brevo.provider';
import { NodemailerProvider } from './providers/nodemailer.provider';

@Global()
@Module({
  providers: [
    {
      provide: EmailProvider,
      useFactory: () => {
        const provider = process.env.EMAIL_PROVIDER || 'nodemailer';
        if (provider === 'brevo') {
          return new BrevoEmailProvider();
        }
        return new NodemailerProvider();
      },
    },
  ],
  exports: [EmailProvider],
})
export class EmailModule {}
