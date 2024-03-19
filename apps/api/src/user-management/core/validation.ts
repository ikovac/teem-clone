import { z } from 'zod';
import { Role } from './entities/user.entity';

export const emailSchema = z.string().email();
export const roleSchema = z.nativeEnum(Role);
export const firstNameSchema = z.string();
export const lastNameSchema = z.string();
