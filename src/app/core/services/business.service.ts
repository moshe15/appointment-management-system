import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, collectionData, docData, query, where, addDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Business, Service, Employee } from '../models/business.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  constructor(private firestore: Firestore) {}

  getBusiness(id: string): Observable<Business | null> {
    const businessDoc = doc(this.firestore, `businesses/${id}`);
    return docData(businessDoc) as Observable<Business | null>;
  }

  getBusinesses(): Observable<Business[]> {
    const businessesCollection = collection(this.firestore, 'businesses');
    return collectionData(businessesCollection, { idField: 'id' }) as Observable<Business[]>;
  }

  async createBusiness(business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const businessesCollection = collection(this.firestore, 'businesses');
    
    const newBusiness: Omit<Business, 'id'> = {
      ...business,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(businessesCollection, newBusiness);
    await updateDoc(docRef, { id: docRef.id });
    
    return docRef.id;
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
    const businessDoc = doc(this.firestore, `businesses/${id}`);
    return updateDoc(businessDoc, {
      ...data,
      updatedAt: new Date()
    });
  }

  // שירותים
  async addService(businessId: string, service: Omit<Service, 'id'>): Promise<string> {
    const businessDoc = doc(this.firestore, `businesses/${businessId}`);
    const businessSnapshot = await getDoc(businessDoc);
    const businessData = businessSnapshot.data() as Business;
    
    const newService: Service = {
      ...service,
      id: this.generateId()
    };
    
    const services = [...(businessData.services || []), newService];
    
    await updateDoc(businessDoc, { 
      services,
      updatedAt: new Date()
    });
    
    return newService.id;
  }

  async updateService(businessId: string, service: Service): Promise<void> {
    const businessDoc = doc(this.firestore, `businesses/${businessId}`);
    const businessSnapshot = await getDoc(businessDoc);
    
    if (!businessSnapshot.exists()) {
      throw new Error('העסק לא נמצא');
    }
    
    const businessData = businessSnapshot.data() as Business;
    const services = businessData.services.map(s => 
      s.id === service.id ? service : s
    );
    
    return updateDoc(businessDoc, { 
      services,
      updatedAt: new Date()
    });
  }

  // עובדים
  async addEmployee(businessId: string, employee: Omit<Employee, 'id'>): Promise<string> {
    const businessDoc = doc(this.firestore, `businesses/${businessId}`);
    const businessSnapshot = await getDoc(businessDoc);
    const businessData = businessSnapshot.data() as Business;
    
    const newEmployee: Employee = {
      ...employee,
      id: this.generateId()
    };
    
    const employees = [...(businessData.employees || []), newEmployee];
    
    await updateDoc(businessDoc, { 
      employees,
      updatedAt: new Date()
    });
    
    return newEmployee.id;
  }

  async updateEmployee(businessId: string, employee: Employee): Promise<void> {
    const businessDoc = doc(this.firestore, `businesses/${businessId}`);
    const businessSnapshot = await getDoc(businessDoc);
    
    if (!businessSnapshot.exists()) {
      throw new Error('העסק לא נמצא');
    }
    
    const businessData = businessSnapshot.data() as Business;
    const employees = businessData.employees.map(e => 
      e.id === employee.id ? employee : e
    );
    
    return updateDoc(businessDoc, { 
      employees,
      updatedAt: new Date()
    });
  }
  
  // מייצר מזהה ייחודי
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 