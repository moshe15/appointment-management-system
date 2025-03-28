import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

export interface Appointment {
  id: string;
  businessId: string;
  businessName: string;
  businessAddress: string;
  businessLogo?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  price: number;
  date: Date | string;
  time: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  createdAt: Date | string;
  stylistId?: string;
  stylistName?: string;
  rating?: number;
  feedback?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsDataService {
  private appointments: Appointment[] = [];

  constructor() {
    this.generateMockAppointments();
  }

  getAppointments(): Observable<Appointment[]> {
    return of(this.appointments);
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    const now = new Date();
    const upcoming = this.appointments.filter(app => {
      const appDate = app.date instanceof Date ? app.date : new Date(app.date);
      return appDate >= now && app.status !== 'cancelled';
    });
    return of(upcoming);
  }

  getAppointmentById(id: string): Observable<Appointment | undefined> {
    const appointment = this.appointments.find(app => app.id === id);
    return of(appointment);
  }

  addAppointment(appointmentData: Partial<Appointment>): Observable<Appointment> {
    const newAppointment: Appointment = {
      id: this.generateId(),
      businessId: appointmentData.businessId || '',
      businessName: appointmentData.businessName || '',
      businessAddress: appointmentData.businessAddress || '',
      businessLogo: appointmentData.businessLogo,
      serviceId: appointmentData.serviceId || '',
      serviceName: appointmentData.serviceName || '',
      serviceCategory: appointmentData.serviceCategory || '',
      price: appointmentData.price || 0,
      date: appointmentData.date || new Date(),
      time: appointmentData.time || '',
      duration: appointmentData.duration || 0,
      startTime: appointmentData.startTime || '',
      endTime: appointmentData.endTime || '',
      status: appointmentData.status || 'confirmed',
      notes: appointmentData.notes || '',
      createdAt: new Date(),
      stylistId: appointmentData.stylistId,
      stylistName: appointmentData.stylistName,
      rating: appointmentData.rating,
      feedback: appointmentData.feedback
    };
    
    this.appointments.push(newAppointment);
    return of(newAppointment);
  }

  updateAppointment(id: string, data: Partial<Appointment>): Observable<Appointment | undefined> {
    const index = this.appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      this.appointments[index] = { ...this.appointments[index], ...data };
      return of(this.appointments[index]);
    }
    return of(undefined);
  }

  cancelAppointment(id: string): Observable<boolean> {
    const index = this.appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      this.appointments[index].status = 'cancelled';
      return of(true);
    }
    return of(false);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateMockAppointments() {
    this.appointments = [
      {
        id: '1',
        businessId: 'biz1',
        businessName: 'סלון יופי אביבה',
        businessAddress: 'רחוב הרצל 10, תל אביב',
        businessLogo: 'assets/images/salon-logo.png',
        serviceId: 'svc1',
        serviceName: 'תספורת נשים',
        serviceCategory: 'תספורות',
        price: 120,
        date: new Date('2023-12-30'),
        time: '14:00',
        duration: 60,
        startTime: '14:00',
        endTime: '15:00',
        status: 'completed',
        notes: '',
        createdAt: new Date('2023-12-15'),
        rating: 5,
        feedback: 'שירות מעולה! אביבה הייתה מקצועית ואדיבה.'
      },
      {
        id: '2',
        businessId: 'biz2',
        businessName: 'מספרת דוד',
        businessAddress: 'רחוב אלנבי 45, תל אביב',
        businessLogo: 'assets/images/barber-logo.png',
        serviceId: 'svc2',
        serviceName: 'תספורת גברים',
        serviceCategory: 'תספורות',
        price: 80,
        date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 ימים מהיום
        time: '10:30',
        duration: 45,
        startTime: '10:30',
        endTime: '11:15',
        status: 'confirmed',
        notes: 'מעוניין בתספורת קצרה',
        createdAt: new Date()
      }
    ];
  }

  getAppointmentHistory(): Observable<Appointment[]> {
    return this.getAppointments();
  }

  getAppointmentsForCurrentUser(): Observable<Appointment[]> {
    return this.getAppointments();
  }
} 