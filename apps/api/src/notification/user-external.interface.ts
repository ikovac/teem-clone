export interface IUserExternalService {
  getUserById(id: number): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  }>;
}
