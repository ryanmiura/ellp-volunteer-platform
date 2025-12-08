import api from './api';
import type { 
  Workshop, 
  CreateWorkshopRequest, 
  UpdateWorkshopRequest,
  WorkshopFilter 
} from '../types/workshop.types';

export const workshopsService = {
  // Criar oficina
  async create(data: CreateWorkshopRequest): Promise<Workshop> {
    const response = await api.post<Workshop>('/workshops', data);
    return response.data;
  },

  // Buscar oficina por ID
  async getById(id: string): Promise<Workshop> {
    const response = await api.get<Workshop>(`/workshops/${id}`);
    return response.data;
  },

  // Listar todas as oficinas com filtros
  async getAll(filters?: WorkshopFilter): Promise<Workshop[]> {
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('name', filters.name);
    if (filters?.month) params.append('month', filters.month);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<Workshop[]>(`/workshops?${params.toString()}`);
    return response.data;
  },

  // Atualizar oficina
  async update(id: string, data: UpdateWorkshopRequest): Promise<Workshop> {
    const response = await api.put<Workshop>(`/workshops/${id}`, data);
    return response.data;
  },

  // Deletar oficina
  async delete(id: string): Promise<void> {
    await api.delete(`/workshops/${id}`);
  },

  // Adicionar voluntário à oficina
  async addVolunteer(workshopId: string, volunteerId: string): Promise<void> {
    await api.post(`/workshops/${workshopId}/volunteers/${volunteerId}`);
  },

  // Remover voluntário da oficina
  async removeVolunteer(workshopId: string, volunteerId: string): Promise<void> {
    await api.delete(`/workshops/${workshopId}/volunteers/${volunteerId}`);
  },

  // Buscar oficinas de um voluntário
  async getByVolunteer(volunteerId: string): Promise<Workshop[]> {
    const response = await api.get<Workshop[]>(`/volunteers/${volunteerId}/workshops`);
    return response.data;
  },
};
