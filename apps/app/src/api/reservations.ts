import instance from './request';

export function getAll() {
  return instance.get('/reservations').then(response => response.data);
}

export function create(payload: {
  reservationItemId: number;
  startDate: Date;
  endDate: Date;
}) {
  return instance
    .post('/reservations', payload)
    .then(response => response.data);
}
