export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type User = {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
};
