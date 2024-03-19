export class EntityNotFoundException extends Error {
  constructor(entityName: string) {
    super(`The ${entityName} not found`);
    this.name = this.constructor.name;
  }
}
