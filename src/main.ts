import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
