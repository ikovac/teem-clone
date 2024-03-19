import { Pagination } from './pagination';

export {};

declare global {
  namespace Express {
    export interface Request {
      userId?: number;
      pagination?: Pagination;
    }
  }
}
