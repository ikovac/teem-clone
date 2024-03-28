import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
import cmsConfig from 'config/cms.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(
    @Inject(cmsConfig.KEY)
    private config: ConfigType<typeof cmsConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { rawBody, headers } = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    const secret = this.config.webhookSecret;
    const signature = headers[SIGNATURE_HEADER_NAME];

    if (!rawBody || !signature) return false;

    return isValidSignature(rawBody.toString(), signature as string, secret);
  }
}
