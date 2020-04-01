import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const { port } = serverConfig;
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({ origin: serverConfig.get('origin') });
    logger.log(`Accepting requests from origin ${serverConfig.get('origin')}`);
  }
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
