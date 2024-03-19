// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEvent {}

export abstract class BaseEvent implements IEvent {
  createdAt: Date;

  constructor() {
    this.createdAt = new Date();
  }
}
