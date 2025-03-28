export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  employeeId: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 