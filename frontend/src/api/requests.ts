import api from './client';

export interface VacationRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments: string | null;
  createdAt: string;
  user: { id: number; name: string; role: string };
}

export interface User {
  id: number;
  name: string;
  role: 'Requester' | 'Validator';
}

export const getUsers = () => api.get<User[]>('/users');

export const getMyRequests = (userId: number) =>
  api.get<VacationRequest[]>(`/requests?userId=${userId}`);

export const getAllRequests = (status?: string) =>
  api.get<VacationRequest[]>(`/requests${status ? `?status=${status}` : ''}`);

export const submitRequest = (payload: {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}) => api.post<VacationRequest>('/requests', payload);

export const updateRequest = (id: number, payload: { status: string; comments?: string }) =>
  api.patch<VacationRequest>(`/requests/${id}`, payload);
