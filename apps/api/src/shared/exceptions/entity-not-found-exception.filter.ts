import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { EntityNotFoundException } from './entity-not-found.exception';

@Catch(EntityNotFoundException)
export class EntityNotFoundExceptionFilter extends BaseExceptionFilter {
  catch(exception: EntityNotFoundException, host: ArgumentsHost) {
    super.catch(new BadRequestException(exception.message), host);
  }
}
