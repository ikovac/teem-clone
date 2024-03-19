import { z } from 'zod';

export const idSchema = z.number();
export const startDateSchema = z.coerce.date();
export const endDateSchema = z.coerce.date();
export const userIdSchema = z.number();
