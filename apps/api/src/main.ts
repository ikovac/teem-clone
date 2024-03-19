import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const logger = app.get(Logger);
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port')!;

  app.enableShutdownHooks();
  app.setGlobalPrefix('/api');
  app.enableCors();
  app.useLogger(logger);

  attachApiDocumentation(app);

  await app.listen(port, () => {
    logger.log(`🚀 Application is listening on port ${port}`);
  });
}

bootstrap();

function attachApiDocumentation(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Teem Clone API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
}
