import { api } from '@/lib/api';

export interface Appointment {
  id: string;
  type: 'Virtual' | 'Phone' | 'Office';
  with: string;
  withId: string;
  clientId: string;
  clientName: string;
  date: string;
  duration: number;
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  meetingLink?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    return api.get('/appointments');
  },

  async getByClient(clientId: string): Promise<Appointment[]> {
    return api.get(`/appointments?clientId=${clientId}`);
  },

  async create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return api.post('/appointments', appointment);
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return api.put(`/appointments/${id}`, updates);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/appointments/${id}`);
  }
};