export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  workingHours: WorkingHours[];
  services: Service[];
  employees: Employee[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  day: number; // 0-6, יום ראשון עד יום שבת
  open: string; // HH:MM format
  close: string; // HH:MM format
  isClosed: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // בדקות
  price: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  services: string[]; // ID של השירותים שהעובד יכול לספק
  workingHours: WorkingHours[];
} 