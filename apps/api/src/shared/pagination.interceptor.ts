import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Request } from 'express';
import { Observable, from, switchMap } from 'rxjs';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  itemsPerPage: z.coerce.number().positive().optional().default(10),
});

export class PaginationQuery implements z.infer<typeof paginationSchema> {
  @ApiPropertyOptional({
    default: 1,
  })
  page: number;
  @ApiPropertyOptional({
    default: 10,
  })
  itemsPerPage: number;
}

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    return from(paginationSchema.parseAsync(req.query)).pipe(
      switchMap((pagination) => {
        req.pagination = pagination;
        return next.handle();
      }),
    );
  }
}
