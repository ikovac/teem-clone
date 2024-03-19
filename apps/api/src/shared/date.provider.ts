import { Injectable } from '@nestjs/common';

export const IDateProvider = Symbol('IDateProvider');

export interface IDateProvider {
  now(): Date;
}

@Injectable()
export class DateProvider implements IDateProvider {
  now(): Date {
    return new Date();
  }
}
