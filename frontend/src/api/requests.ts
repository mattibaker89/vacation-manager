import api from './client';
import type { User, VacationRequest, SubmitRequestPayload, UpdateRequestPayload } from '../types';

export type { User, VacationRequest };

export const getUsers = () => api.get<User[]>('/users');

export const createUser = (payload: { name: string; role: string }) =>
  api.post<User>('/users', payload);

export const getMyRequests = (userId: number) =>
  api.get<VacationRequest[]>(`/requests?userId=${userId}`);

export const getAllRequests = (status?: string) =>
  api.get<VacationRequest[]>(`/requests${status ? `?status=${status}` : ''}`);

export const submitRequest = (payload: SubmitRequestPayload) =>
  api.post<VacationRequest>('/requests', payload);

export const updateRequest = (id: number, payload: UpdateRequestPayload) =>
  api.patch<VacationRequest>(`/requests/${id}`, payload);
