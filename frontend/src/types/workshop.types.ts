export interface Workshop {
  id: string;
  name: string;
  date: string;
  description?: string;
  volunteers: string[];
  created_at: string;
  updated_at: string;
}

// Request Types
export interface CreateWorkshopRequest {
  name: string;
  date: string;
  description?: string;
}

export interface UpdateWorkshopRequest {
  name?: string;
  date?: string;
  description?: string;
}

// Filter Types
export interface WorkshopFilter {
  name?: string;
  month?: string; // Format: YYYY-MM
  year?: string;  // Format: YYYY
  page?: number;
  limit?: number;
}

// Form Types
export interface WorkshopFormData {
  name: string;
  date: string;
  description?: string;
}

// Validation Types
export interface WorkshopFormErrors {
  name?: string;
  date?: string;
  description?: string;
}
