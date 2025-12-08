import api from './api';
import type { Volunteer, VolunteerFormData } from '../types/volunteer.types';

export const volunteersService = {
  async getAll(): Promise<Volunteer[]> {
    const response = await api.get<{ volunteers: Volunteer[] }>('/api/volunteers');
    return response.data.volunteers;
  },

  async getById(id: string): Promise<Volunteer> {
    const response = await api.get<{ volunteer: Volunteer }>(`/api/volunteers/${id}`);
    return response.data.volunteer;
  },

  async create(data: VolunteerFormData): Promise<Volunteer> {
    const response = await api.post<{ volunteer: Volunteer }>('/api/volunteers', data);
    return response.data.volunteer;
  },

  async update(id: string, data: Partial<VolunteerFormData>): Promise<Volunteer> {
    const response = await api.put<{ volunteer: Volunteer }>(`/api/volunteers/${id}`, data);
    return response.data.volunteer;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/volunteers/${id}`);
  }
};
