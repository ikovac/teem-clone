import type { User } from '@/models/user';
import instance from './request';

export function getAll(params?: { page?: number; itemsPerPage?: number }) {
  return instance.get('/users', { params }).then(response => response.data);
}

export function create(payload: Omit<User, 'id'>) {
  return instance.post('/users', payload).then(response => response.data);
}
