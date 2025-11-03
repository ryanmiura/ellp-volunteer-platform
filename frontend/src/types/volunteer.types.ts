export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAcademic: boolean;
  course?: string;
  ra?: string;
  entryDate: Date;
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

// Form Types
export interface VolunteerFormData {
  name: string;
  email: string;
  phone?: string;
  isAcademic: boolean;
  course?: string;
  ra?: string;
}

export interface UpdateVolunteerForm extends Partial<VolunteerFormData> {
  id: string;
}

// Validation Types
export interface VolunteerFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  ra?: string;
}