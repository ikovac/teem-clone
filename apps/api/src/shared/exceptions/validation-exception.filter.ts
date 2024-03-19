import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ValidationExceptionFilter extends BaseExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const [message] = exception.errors.map(
      (it) => `[${it.code}]: ${it.message} for '${it.path}'`,
    );
    super.catch(new BadRequestException(message), host);
  }
}
