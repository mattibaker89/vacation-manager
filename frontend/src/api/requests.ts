import api from './client';
import type { User, VacationRequest, SubmitRequestPayload, UpdateRequestPayload } from '../types';

export type { User, VacationRequest };

export const login = (name: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login', { name, password });

export const getUsers = () => api.get<User[]>('/users');

export const createUser = (payload: { name: string; role: string; password: string }) =>
  api.post<User>('/users', payload);

export const getMyRequests = () => api.get<VacationRequest[]>('/requests');

export const getAllRequests = (status?: string) =>
  api.get<VacationRequest[]>(`/requests${status ? `?status=${status}` : ''}`);

export const submitRequest = (payload: SubmitRequestPayload) =>
  api.post<VacationRequest>('/requests', payload);

export const updateRequest = (id: number, payload: UpdateRequestPayload) =>
  api.patch<VacationRequest>(`/requests/${id}`, payload);
