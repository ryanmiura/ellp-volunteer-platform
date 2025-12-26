export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_academic: boolean;
  course?: string;
  ra?: string;
  entry_date: string;
  exit_date?: string;
  is_active: boolean;
  workshops?: string[];
  created_at: string;
  updated_at: string;
}

// Request Types
export interface CreateVolunteerRequest {
  name: string;
  email: string;
  phone?: string;
  is_academic: boolean;
  course?: string;
  ra?: string;
  entry_date: string;
}

export interface UpdateVolunteerRequest {
  name?: string;
  email?: string;
  phone?: string;
  is_academic?: boolean;
  course?: string;
  ra?: string;
  entry_date?: string;
}

export interface InactivateVolunteerRequest {
  exit_date: string;
}

// Filter Types
export interface VolunteerFilter {
  name?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// Form Types
export interface VolunteerFormData {
  name: string;
  email: string;
  phone?: string;
  isAcademic: boolean;
  course?: string;
  ra?: string;
  entryDate: string;
}

// Validation Types
export interface VolunteerFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  ra?: string;
  entryDate?: string;
}