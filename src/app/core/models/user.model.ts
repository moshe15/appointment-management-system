export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: 'client' | 'business' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUser extends User {
  role: 'client';
  preferredBusinesses: string[];
  appointments: string[];
}

export interface BusinessUser extends User {
  role: 'business';
  businessId: string;
} 