export interface Workshop {
  id: string;
  name: string;
  date: Date;
  description?: string;
  volunteers: string[]; // Array of volunteer IDs
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface WorkshopResponse {
  workshop: Workshop;
}

export interface WorkshopsListResponse {
  workshops: Workshop[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface WorkshopFormData {
  name: string;
  date: Date;
  description?: string;
}

export interface UpdateWorkshopForm extends Partial<WorkshopFormData> {
  id: string;
}

// Validation Types
export interface WorkshopFormErrors {
  name?: string;
  date?: string;
  description?: string;
}

// Detailed workshop with volunteer information
export interface WorkshopWithVolunteers extends Omit<Workshop, 'volunteers'> {
  volunteers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}
