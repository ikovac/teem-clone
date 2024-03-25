import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IdentityExternalService } from 'auth/api/external';
import { Request, Response } from 'express';
import { auth, claimIncludes } from 'express-oauth2-jwt-bearer';
import { promisify } from 'node:util';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private identityService: IdentityExternalService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const permissions =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    await this.validateJwt(request, response);
    await this.assignIdentityIdToRequest(request);
    await this.checkPermissions(request, response, permissions);

    return true;
  }

  private validateJwt(request: Request, response: Response): Promise<void> {
    const { domain, audience } = this.configService.get('auth');
    return promisify(
      auth({
        audience,
        issuer: `https://${domain}/`,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
        tokenSigningAlg: 'RS256',
      }),
    )(request, response).catch(() => {
      throw new UnauthorizedException();
    });
  }

  private async assignIdentityIdToRequest(request: Request): Promise<void> {
    const sub = request.auth?.payload.sub;
    if (!sub) throw new UnauthorizedException();
    try {
      const identity = await this.identityService.getByIdentityProviderId(sub);
      request.userId = identity.id;
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw new UnauthorizedException();
      }
      throw error;
    }
  }

  private checkPermissions(
    request: Request,
    response: Response,
    permissions: string[],
  ) {
    const requiredPermissions = claimIncludes.bind(null, 'permissions');
    return promisify(requiredPermissions(...permissions))(
      request,
      response,
    ).catch(() => {
      throw new ForbiddenException();
    });
  }
}
