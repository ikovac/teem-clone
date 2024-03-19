import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserCommand } from 'user-management/application/commands/create-user.command';
import { GetAllUsersQuery } from 'user-management/application/queries/get-all-users.query';
import { GetAllUsersResult } from 'user-management/application/dto/get-all-users-result.dto';
import { CreateUserPayload } from 'user-management/application/dto/create-user-payload.dto';
import {
  PaginationInterceptor,
  PaginationQuery,
} from 'shared/pagination.interceptor';
import { Request } from 'express';
import { UserExistsException } from 'user-management/core/exceptions/user-exists.exception';
import { AuthGuard } from 'shared/auth/auth.guard';
import { Permissions } from 'shared/auth/permission.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UserManagementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBody({ type: CreateUserPayload })
  @ApiResponse({
    status: 201,
    description: 'The user record has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'The payload is invalid or the user already exists.',
  })
  @Post()
  @Permissions('create:users')
  async create(@Body() body: CreateUserPayload): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateUserCommand(
          body.email,
          body.role,
          body.firstName,
          body.lastName,
        ),
      );
    } catch (error) {
      if (error instanceof UserExistsException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: GetAllUsersResult,
  })
  @ApiQuery({ type: () => PaginationQuery })
  @UseInterceptors(PaginationInterceptor)
  @Permissions('read:users')
  getAll(@Req() req: Request): Promise<GetAllUsersResult> {
    return this.queryBus.execute(new GetAllUsersQuery(req.pagination));
  }
}
