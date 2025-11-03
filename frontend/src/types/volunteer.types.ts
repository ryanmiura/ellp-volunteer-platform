export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAcademic: boolean;
  course?: string;
  ra?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface VolunteerResponse {
  volunteer: Volunteer;
}

export interface VolunteersListResponse {
  volunteers: Volunteer[];
  total: number;
  page: number;
  limit: number;
}

