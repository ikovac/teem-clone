export class UserExistsException extends Error {
  constructor(email: string) {
    super(`User with the email ${email} already exists`);
    this.name = this.constructor.name;
  }
}
