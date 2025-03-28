import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, collectionData, docData, query, where, orderBy, addDoc, updateDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const appointmentsCollection = collection(this.firestore, 'appointments');
    
    const newAppointment: Omit<Appointment, 'id'> = {
      ...appointment,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(appointmentsCollection, newAppointment);
    await updateDoc(docRef, { id: docRef.id });
    
    return docRef.id;
  }

  getAppointmentById(id: string): Observable<Appointment | null> {
    const appointmentDoc = doc(this.firestore, `appointments/${id}`);
    return docData(appointmentDoc) as Observable<Appointment | null>;
  }

  getClientAppointments(clientId: string): Observable<Appointment[]> {
    const appointmentsCollection = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsCollection, 
      where('clientId', '==', clientId),
      orderBy('date', 'asc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Appointment[]>;
  }

  getBusinessAppointments(businessId: string, date?: Date): Observable<Appointment[]> {
    const appointmentsCollection = collection(this.firestore, 'appointments');
    
    let q;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      q = query(
        appointmentsCollection, 
        where('businessId', '==', businessId),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        orderBy('date', 'asc'),
        orderBy('startTime', 'asc')
      );
    } else {
      q = query(
        appointmentsCollection, 
        where('businessId', '==', businessId),
        orderBy('date', 'asc'),
        orderBy('startTime', 'asc')
      );
    }
    
    return collectionData(q, { idField: 'id' }) as Observable<Appointment[]>;
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    const appointmentDoc = doc(this.firestore, `appointments/${id}`);
    return updateDoc(appointmentDoc, { 
      status,
      updatedAt: new Date()
    });
  }

  cancelAppointment(id: string): Promise<void> {
    return this.updateAppointmentStatus(id, 'cancelled');
  }

  // הבדיקה האם יש חפיפה בתורים עבור עובד מסוים
  checkEmployeeAvailability(
    employeeId: string, 
    date: Date, 
    startTime: string, 
    endTime: string, 
    excludeAppointmentId?: string
  ): Observable<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsCollection = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsCollection,
      where('employeeId', '==', employeeId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('status', 'in', ['scheduled', 'confirmed'])
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(appointments => {
        // סנן תור שאנחנו רוצים לעדכן (אם יש)
        let filteredAppointments = appointments as Appointment[];
        if (excludeAppointmentId) {
          filteredAppointments = filteredAppointments.filter(a => a.id !== excludeAppointmentId);
        }
        
        // בדוק אם יש חפיפה בין התור החדש לתורים קיימים
        return !filteredAppointments.some(appointment => {
          return (
            (startTime >= appointment.startTime && startTime < appointment.endTime) ||
            (endTime > appointment.startTime && endTime <= appointment.endTime) ||
            (startTime <= appointment.startTime && endTime >= appointment.endTime)
          );
        });
      })
    );
  }
} 