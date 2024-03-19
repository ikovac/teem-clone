export class ReservationOverlapException extends Error {
  constructor() {
    super('Reservation overlaps with the existing reservation');
    this.name = this.constructor.name;
  }
}
