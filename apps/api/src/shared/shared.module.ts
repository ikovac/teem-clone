import { Module, Global } from '@nestjs/common';
import { IUUIDProvider, UUIDProvider } from './uuid.provider';
import {
  DomainEventPublisher,
  IDomainEventPublisher,
} from './event/domain-event-publisher';
import { AuthModule } from 'auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { ValidationExceptionFilter } from './exceptions/validation-exception.filter';
import { EntityNotFoundExceptionFilter } from './exceptions/entity-not-found-exception.filter';
import { DateProvider, IDateProvider } from './date.provider';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: IUUIDProvider,
      useClass: UUIDProvider,
    },
    {
      provide: IDomainEventPublisher,
      useClass: DomainEventPublisher,
    },
    {
      provide: IDateProvider,
      useClass: DateProvider,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: EntityNotFoundExceptionFilter,
    },
  ],
  exports: [IUUIDProvider, IDomainEventPublisher, IDateProvider, AuthModule],
})
export class SharedModule {}
