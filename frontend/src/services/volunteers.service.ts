import api from './api';
import type { 
  Volunteer, 
  CreateVolunteerRequest, 
  UpdateVolunteerRequest, 
  InactivateVolunteerRequest,
  VolunteerFilter 
} from '../types/volunteer.types';

export const volunteersService = {
  // Criar voluntário
  async create(data: CreateVolunteerRequest): Promise<Volunteer> {
    const response = await api.post<Volunteer>('/volunteers', data);
    return response.data;
  },

  // Buscar voluntário por ID
  async getById(id: string): Promise<Volunteer> {
    const response = await api.get<Volunteer>(`/volunteers/${id}`);
    return response.data;
  },

  // Listar todos os voluntários com filtros
  async getAll(filters?: VolunteerFilter): Promise<Volunteer[]> {
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('name', filters.name);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<Volunteer[]>(`/volunteers?${params.toString()}`);
    return response.data;
  },

  // Atualizar voluntário
  async update(id: string, data: UpdateVolunteerRequest): Promise<Volunteer> {
    const response = await api.put<Volunteer>(`/volunteers/${id}`, data);
    return response.data;
  },

  // Deletar voluntário
  async delete(id: string): Promise<void> {
    await api.delete(`/volunteers/${id}`);
  },

  // Inativar voluntário
  async inactivate(id: string, data: InactivateVolunteerRequest): Promise<Volunteer> {
    const response = await api.post<Volunteer>(`/volunteers/${id}/inactivate`, data);
    return response.data;
  },

  // Adicionar oficina ao voluntário
  async addWorkshop(volunteerId: string, workshopId: string): Promise<void> {
    await api.post(`/volunteers/${volunteerId}/workshops/${workshopId}`);
  },

  // Remover oficina do voluntário
  async removeWorkshop(volunteerId: string, workshopId: string): Promise<void> {
    await api.delete(`/volunteers/${volunteerId}/workshops/${workshopId}`);
  },
};
