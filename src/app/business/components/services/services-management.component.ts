import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AuthService } from '../../../auth/services/auth.service';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

@Component({
  selector: 'app-services-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    DropdownModule,
    TooltipModule,
    InputSwitchModule
  ],
  template: `
    <div class="container">
      <h1 class="text-center my-4">ניהול שירותים</h1>
      
      <div class="actions-section mb-4">
        <button pButton label="הוסף שירות חדש" icon="pi pi-plus" (click)="showServiceDialog('new')" class="p-button-primary"></button>
      </div>
      
      <p-card>
        <div class="empty-state" *ngIf="services.length === 0">
          <p>אין שירותים רשומים במערכת.</p>
          <p>התחל על ידי הוספת השירות הראשון שלך.</p>
          <button pButton label="הוסף שירות חדש" icon="pi pi-plus" (click)="showServiceDialog('new')" class="p-button-outlined"></button>
        </div>
        
        <!-- טבלת שירותים -->
        <p-table [value]="services" *ngIf="services.length > 0" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>שם השירות</th>
              <th>תיאור</th>
              <th>משך זמן (דקות)</th>
              <th>מחיר</th>
              <th>פעיל?</th>
              <th>פעולות</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-service>
            <tr>
              <td>{{service.name}}</td>
              <td>{{service.description}}</td>
              <td>{{service.duration}}</td>
              <td>₪{{service.price}}</td>
              <td>
                <p-inputSwitch [(ngModel)]="service.isActive" (onChange)="updateServiceStatus(service)"></p-inputSwitch>
              </td>
              <td>
                <button pButton icon="pi pi-pencil" pTooltip="ערוך" (click)="showServiceDialog('edit', service)" class="p-button-text p-button-sm"></button>
                <button pButton icon="pi pi-trash" pTooltip="מחק" (click)="deleteService(service)" class="p-button-text p-button-danger p-button-sm"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      
      <div class="mt-4">
        <button pButton label="חזרה לדשבורד" icon="pi pi-arrow-left" routerLink="/business" class="p-button-secondary"></button>
      </div>
    </div>
    
    <!-- דיאלוג הוספת/עריכת שירות -->
    <p-dialog 
      [(visible)]="serviceDialogVisible" 
      [header]="dialogMode === 'new' ? 'הוספת שירות חדש' : 'עריכת שירות'" 
      [style]="{width: '500px'}"
    >
      <div class="service-form">
        <div class="field">
          <label for="name">שם השירות *</label>
          <input 
            type="text"
            pInputText
            id="name"
            [(ngModel)]="currentService.name"
            placeholder="שם השירות"
            class="w-full"
            required
          />
        </div>
        
        <div class="field">
          <label for="description">תיאור</label>
          <textarea 
            pInputTextarea
            id="description"
            [(ngModel)]="currentService.description"
            placeholder="תיאור השירות"
            rows="3"
            class="w-full"
          ></textarea>
        </div>
        
        <div class="field">
          <label for="duration">משך זמן (דקות) *</label>
          <p-dropdown 
            id="duration"
            [(ngModel)]="currentService.duration"
            [options]="durationOptions"
            placeholder="בחר משך זמן"
            styleClass="w-full"
          ></p-dropdown>
        </div>
        
        <div class="field">
          <label for="price">מחיר *</label>
          <p-inputNumber 
            id="price"
            [(ngModel)]="currentService.price"
            mode="currency" 
            currency="ILS" 
            locale="he-IL"
            placeholder="0.00"
            class="w-full"
          ></p-inputNumber>
        </div>
        
        <div class="field-checkbox">
          <p-inputSwitch [(ngModel)]="currentService.isActive"></p-inputSwitch>
          <label class="mr-2">פעיל</label>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="שמור" icon="pi pi-check" (click)="saveService()" class="p-button-success"></button>
        <button pButton label="ביטול" icon="pi pi-times" (click)="serviceDialogVisible = false" class="p-button-secondary"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .actions-section {
      display: flex;
      justify-content: flex-end;
    }
    
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #666;
    }
    
    .empty-state p {
      margin-bottom: 10px;
    }
    
    .field {
      margin-bottom: 1.5rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .field-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
    }
  `]
})
export class ServicesManagementComponent {
  services: Service[] = [
    {
      id: '1',
      name: 'תספורת גברים',
      description: 'תספורת גברים כולל שמפו',
      duration: 30,
      price: 80,
      isActive: true
    },
    {
      id: '2',
      name: 'תספורת נשים',
      description: 'תספורת נשים כולל שמפו וייבוש',
      duration: 60,
      price: 150,
      isActive: true
    },
    {
      id: '3',
      name: 'צבע שיער',
      description: 'צביעת שיער מקצועית',
      duration: 120,
      price: 200,
      isActive: true
    }
  ];
  
  serviceDialogVisible = false;
  dialogMode: 'new' | 'edit' = 'new';
  
  currentService: Service = this.getEmptyService();
  
  durationOptions = [
    { label: '15 דקות', value: 15 },
    { label: '30 דקות', value: 30 },
    { label: '45 דקות', value: 45 },
    { label: '60 דקות', value: 60 },
    { label: '75 דקות', value: 75 },
    { label: '90 דקות', value: 90 },
    { label: '120 דקות', value: 120 },
    { label: '150 דקות', value: 150 },
    { label: '180 דקות', value: 180 }
  ];
  
  constructor(private authService: AuthService) {}
  
  getEmptyService(): Service {
    return {
      id: '',
      name: '',
      description: '',
      duration: 30,
      price: 0,
      isActive: true
    };
  }
  
  showServiceDialog(mode: 'new' | 'edit', service?: Service): void {
    this.dialogMode = mode;
    
    if (mode === 'new') {
      this.currentService = this.getEmptyService();
    } else if (service) {
      // שכפול האובייקט כדי לא לשנות את המקור עד לשמירה
      this.currentService = { ...service };
    }
    
    this.serviceDialogVisible = true;
  }
  
  saveService(): void {
    if (!this.currentService.name || !this.currentService.duration || this.currentService.price <= 0) {
      // בדיקת תקינות פשוטה - במציאות יש להשתמש בולידציה של טפסים
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }
    
    if (this.dialogMode === 'new') {
      // הוספת מזהה חדש
      this.currentService.id = Date.now().toString();
      this.services.push(this.currentService);
    } else {
      // עדכון שירות קיים
      const index = this.services.findIndex(s => s.id === this.currentService.id);
      if (index !== -1) {
        this.services[index] = this.currentService;
      }
    }
    
    this.serviceDialogVisible = false;
  }
  
  updateServiceStatus(service: Service): void {
    // כאן נשמור את השינוי בסטטוס השירות בשרת
    console.log(`סטטוס השירות ${service.name} שונה ל-${service.isActive ? 'פעיל' : 'לא פעיל'}`);
  }
  
  deleteService(service: Service): void {
    if (confirm(`האם אתה בטוח שברצונך למחוק את השירות ${service.name}?`)) {
      this.services = this.services.filter(s => s.id !== service.id);
    }
  }
} 