import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { CqrsModule } from '@nestjs/cqrs';
import appConfig from 'config/app.config';
import authConfig from 'config/auth.config';
import databaseConfig from 'config/database.config';
import { DatabaseModule } from 'shared/database/database.module';
import { SharedModule } from 'shared/shared.module';
import { UserManagementModule } from 'user-management/user-management.module';
import { HealthController } from 'health.controller';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from './reservation/reservation.module';
import { NotificationModule } from './notification/notification.module';
import mailConfig from 'config/mail.config';
import cmsConfig from 'config/cms.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, mailConfig, cmsConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => randomUUID(),
        transport: { target: 'pino-pretty' },
        redact: ['req.headers.authorization'],
        quietReqLogger: true,
      },
    }),
    DatabaseModule.forRoot(),
    CqrsModule.forRoot(),
    EventEmitterModule.forRoot(),
    SharedModule,
    UserManagementModule,
    AuthModule,
    ReservationModule,
    NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
