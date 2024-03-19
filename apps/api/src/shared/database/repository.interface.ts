export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  persistAndFlush(entity: T): Promise<void>;
}
