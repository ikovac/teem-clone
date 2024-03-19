import instance from './request';

export function getAll({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  const params = { startDate, endDate };
  return instance
    .get('/inventory-items', { params })
    .then(response => response.data);
}
