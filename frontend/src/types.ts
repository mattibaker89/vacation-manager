export interface User {
  id: number;
  name: string;
  role: 'Requester' | 'Validator';
}

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

export interface SubmitRequestPayload {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateRequestPayload {
  status: string;
  comments?: string;
}
