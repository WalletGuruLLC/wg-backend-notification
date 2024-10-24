import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SecretsService } from './utils/secrets.service';
import * as process from 'node:process'; // Adjust the path based on where SecretsService is located

async function bootstrap() {
	const secretsService = new SecretsService();

	const secrets = await secretsService.getSecretValue(process.env.SECRET_NAME);
	if (secrets) {
		Object.entries(secrets).forEach(([key, value]) => {
			process.env[key] = value;
		});
	} else {
		throw new Error('Secrets in AWS Key Management service are undefined!');
	}

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
