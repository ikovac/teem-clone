import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export const IUUIDProvider = Symbol('IUUIDProvider');

export interface IUUIDProvider {
  generate(): string;
}

@Injectable()
export class UUIDProvider implements IUUIDProvider {
  generate(): string {
    return randomUUID();
  }
}
