import { Inject, Injectable } from '@nestjs/common';
import { pick } from 'radash';
import { IUserExternalService } from './user-external.interface';

@Injectable()
export class UserManagementIntegration {
  constructor(
    @Inject('IUserExternalService')
    private userExternalService: IUserExternalService,
  ) {}

  async getUserById(id: number): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  }> {
    const user = await this.userExternalService.getUserById(id);
    return pick(user, ['id', 'email', 'firstName', 'lastName']);
  }
}
