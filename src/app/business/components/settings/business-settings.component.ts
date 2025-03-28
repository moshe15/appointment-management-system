import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface BusinessDay {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TabViewModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    FileUploadModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="settings-container">
      <p-toast></p-toast>
      
      <div class="page-header">
        <div class="header-content">
          <h1>הגדרות העסק</h1>
          <p class="subtitle">נהל את פרטי העסק ושעות הפעילות</p>
        </div>
      </div>
      
      <p-tabView>
        <!-- פרטי העסק הבסיסיים -->
        <p-tabPanel header="פרטי העסק">
          <div class="business-details">
            <div class="logo-section">
              <h3>לוגו העסק</h3>
              <div class="logo-container">
                <div class="current-logo" *ngIf="businessLogo; else noLogo">
                  <img [src]="businessLogo" alt="לוגו העסק">
                </div>
                <ng-template #noLogo>
                  <div class="no-logo">
                    <i class="pi pi-image"></i>
                  </div>
                </ng-template>
                
                <p-fileUpload mode="basic" chooseLabel="העלאת לוגו" 
                             accept="image/*" [maxFileSize]="1000000"
                             (onUpload)="onLogoUpload($event)" 
                             styleClass="p-button-outlined"></p-fileUpload>
              </div>
            </div>
            
            <div class="form-section">
              <div class="p-field">
                <label for="business-name">שם העסק*</label>
                <input id="business-name" type="text" pInputText [(ngModel)]="businessName" required>
              </div>
              
              <div class="p-field">
                <label for="business-category">קטגוריה*</label>
                <p-dropdown id="business-category" [options]="categories" 
                           [(ngModel)]="selectedCategory" optionLabel="name"
                           placeholder="בחר קטגוריה" [style]="{'width':'100%'}" required></p-dropdown>
              </div>
              
              <div class="p-field">
                <label for="business-description">תיאור העסק</label>
                <textarea id="business-description" pInputTextarea [(ngModel)]="businessDescription" 
                          rows="5" [style]="{'width':'100%'}" placeholder="תאר את העסק שלך"></textarea>
              </div>
              
              <div class="p-field">
                <label for="business-address">כתובת*</label>
                <input id="business-address" type="text" pInputText [(ngModel)]="businessAddress" required>
              </div>
              
              <div class="p-field">
                <label for="business-phone">טלפון*</label>
                <input id="business-phone" type="text" pInputText [(ngModel)]="businessPhone" required>
              </div>
              
              <div class="p-field">
                <label for="business-email">דוא"ל</label>
                <input id="business-email" type="email" pInputText [(ngModel)]="businessEmail">
              </div>
              
              <div class="p-field">
                <label for="business-website">אתר אינטרנט</label>
                <input id="business-website" type="url" pInputText [(ngModel)]="businessWebsite">
              </div>
            </div>
          </div>
        </p-tabPanel>
        
        <!-- שעות פעילות -->
        <p-tabPanel header="שעות פעילות">
          <div class="business-hours">
            <h3>הגדר את שעות הפעילות של העסק</h3>
            
            <div class="working-days">
              <div *ngFor="let day of businessDays" class="day-row">
                <div class="day-name">{{day.day}}</div>
                
                <div class="day-switch">
                  <p-inputSwitch [(ngModel)]="day.isOpen"></p-inputSwitch>
                  <span>{{day.isOpen ? 'פתוח' : 'סגור'}}</span>
                </div>
                
                <div class="time-slots" [class.disabled]="!day.isOpen">
                  <div class="time-slot">
                    <label>שעת פתיחה:</label>
                    <input type="time" pInputText [(ngModel)]="day.startTime" [disabled]="!day.isOpen">
                  </div>
                  
                  <div class="time-slot">
                    <label>שעת סגירה:</label>
                    <input type="time" pInputText [(ngModel)]="day.endTime" [disabled]="!day.isOpen">
                  </div>
                </div>
                
                <div class="break-section" [class.disabled]="!day.isOpen">
                  <div class="break-switch">
                    <p-inputSwitch [(ngModel)]="day.hasBreak" [disabled]="!day.isOpen"></p-inputSwitch>
                    <span>הפסקה באמצע היום</span>
                  </div>
                  
                  <div *ngIf="day.hasBreak" class="break-times">
                    <div class="time-slot">
                      <label>תחילת הפסקה:</label>
                      <input type="time" pInputText [(ngModel)]="day.breakStart" [disabled]="!day.isOpen">
                    </div>
                    
                    <div class="time-slot">
                      <label>סוף הפסקה:</label>
                      <input type="time" pInputText [(ngModel)]="day.breakEnd" [disabled]="!day.isOpen">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </p-tabPanel>
        
        <!-- הגדרות תורים -->
        <p-tabPanel header="הגדרות תורים">
          <div class="appointment-settings">
            <h3>הגדרות מערכת התורים</h3>
            
            <div class="settings-form">
              <div class="p-field">
                <label for="appointment-duration">משך ברירת מחדל לתור (בדקות)</label>
                <input id="appointment-duration" type="number" pInputText [(ngModel)]="defaultAppointmentDuration" min="5" step="5">
              </div>
              
              <div class="p-field">
                <label for="appointment-interval">מרווח בין תורים (בדקות)</label>
                <input id="appointment-interval" type="number" pInputText [(ngModel)]="appointmentInterval" min="0" step="5">
              </div>
              
              <div class="p-field">
                <label for="advance-booking">הזמנה מראש מותרת עד (ימים)</label>
                <input id="advance-booking" type="number" pInputText [(ngModel)]="maxAdvanceBookingDays" min="1">
              </div>
              
              <div class="p-field switch-field">
                <p-inputSwitch [(ngModel)]="allowClientCancellation"></p-inputSwitch>
                <label>אפשר ללקוחות לבטל תורים</label>
              </div>
              
              <div class="p-field switch-field">
                <p-inputSwitch [(ngModel)]="allowClientRescheduling"></p-inputSwitch>
                <label>אפשר ללקוחות לשנות מועד</label>
              </div>
              
              <div class="p-field switch-field">
                <p-inputSwitch [(ngModel)]="requireApproval"></p-inputSwitch>
                <label>דרוש אישור ידני לתורים חדשים</label>
              </div>
              
              <div class="p-field switch-field">
                <p-inputSwitch [(ngModel)]="sendReminders"></p-inputSwitch>
                <label>שלח תזכורות לתורים</label>
              </div>
              
              <div class="p-field" *ngIf="sendReminders">
                <label for="reminder-hours">שלח תזכורת לפני התור (שעות)</label>
                <input id="reminder-hours" type="number" pInputText [(ngModel)]="reminderHoursBefore" min="1">
              </div>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>
      
      <div class="form-actions">
        <button pButton pRipple type="button" label="ביטול" class="p-button-text"></button>
        <button pButton pRipple type="button" label="שמור שינויים" class="p-button-primary" (click)="saveSettings()"></button>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 1rem;
    }
    
    .page-header {
      margin-bottom: 1.5rem;
    }
    
    .header-content h1 {
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }
    
    .subtitle {
      color: #6c757d;
      margin-top: 0;
    }
    
    .business-details {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .logo-section {
      margin-bottom: 1rem;
    }
    
    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .current-logo img {
      max-width: 150px;
      max-height: 150px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    
    .no-logo {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .no-logo i {
      font-size: 3rem;
      color: #ccc;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .p-field {
      margin-bottom: 1.5rem;
    }
    
    .p-field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .working-days {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .day-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: #f8f9fa;
      align-items: center;
    }
    
    .day-name {
      font-weight: 600;
      min-width: 100px;
    }
    
    .day-switch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 100px;
    }
    
    .time-slots {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .time-slot {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .time-slot label {
      font-size: 0.85rem;
    }
    
    .break-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #ddd;
      width: 100%;
    }
    
    .break-switch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .break-times {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .settings-form {
      max-width: 600px;
    }
    
    .switch-field {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
    }
    
    .switch-field label {
      margin-bottom: 0;
    }
    
    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      .business-details {
        flex-direction: row;
      }
      
      .logo-section {
        flex: 0 0 200px;
      }
      
      .form-section {
        flex: 1;
      }
    }
  `]
})
export class BusinessSettingsComponent implements OnInit {
  // נתוני העסק
  businessLogo: string | null = null;
  businessName: string = '';
  selectedCategory: Category | null = null;
  businessDescription: string = '';
  businessAddress: string = '';
  businessPhone: string = '';
  businessEmail: string = '';
  businessWebsite: string = '';
  
  // שעות פעילות
  businessDays: any[] = [
    { day: 'ראשון', isOpen: true, startTime: '09:00', endTime: '18:00', hasBreak: false },
    { day: 'שני', isOpen: true, startTime: '09:00', endTime: '18:00', hasBreak: false },
    { day: 'שלישי', isOpen: true, startTime: '09:00', endTime: '18:00', hasBreak: false },
    { day: 'רביעי', isOpen: true, startTime: '09:00', endTime: '18:00', hasBreak: false },
    { day: 'חמישי', isOpen: true, startTime: '09:00', endTime: '18:00', hasBreak: false },
    { day: 'שישי', isOpen: true, startTime: '09:00', endTime: '14:00', hasBreak: false },
    { day: 'שבת', isOpen: false, startTime: '09:00', endTime: '18:00', hasBreak: false }
  ];
  
  // הגדרות תורים
  defaultAppointmentDuration: number = 30;
  appointmentInterval: number = 5;
  maxAdvanceBookingDays: number = 30;
  allowClientCancellation: boolean = true;
  allowClientRescheduling: boolean = true;
  requireApproval: boolean = false;
  sendReminders: boolean = true;
  reminderHoursBefore: number = 24;
  
  // רשימת קטגוריות
  categories: Category[] = [
    { id: 'beauty', name: 'יופי וטיפוח' },
    { id: 'health', name: 'בריאות ורפואה' },
    { id: 'sport', name: 'ספורט וכושר' },
    { id: 'education', name: 'חינוך והדרכה' },
    { id: 'food', name: 'מזון והסעדה' },
    { id: 'retail', name: 'קמעונאות' },
    { id: 'professional', name: 'שירותים מקצועיים' },
    { id: 'other', name: 'אחר' }
  ];
  
  constructor(private messageService: MessageService) { }
  
  ngOnInit(): void {
    // בהתחברות לאפליקציה אמיתית היינו טוענים כאן את נתוני העסק מהשרת
    this.loadBusinessData();
  }
  
  loadBusinessData(): void {
    // דוגמא לטעינת נתוני דמה - במערכת אמיתית נטען מהשרת
    this.businessLogo = 'assets/images/logos/default-business.jpg';
    this.businessName = 'המספרה של יוסי';
    this.selectedCategory = this.categories[0]; // יופי וטיפוח
    this.businessDescription = 'מספרה מקצועית לגברים ונשים עם למעלה מ-15 שנות ניסיון בתחום.';
    this.businessAddress = 'רחוב הרצל 25, תל אביב';
    this.businessPhone = '03-1234567';
    this.businessEmail = 'info@yossi-barber.co.il';
    this.businessWebsite = 'www.yossi-barber.co.il';
  }
  
  onLogoUpload(event: any): void {
    const file = event.files[0];
    
    if (file) {
      // במערכת אמיתית היינו מעלים את הקובץ לשרת
      // כאן ניצור URL מקומי לתצוגה מקדימה
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.businessLogo = e.target.result;
        this.messageService.add({
          severity: 'success',
          summary: 'הלוגו הועלה בהצלחה',
          detail: `הקובץ ${file.name} הועלה`
        });
      };
      reader.readAsDataURL(file);
    }
  }
  
  saveSettings(): void {
    // במערכת אמיתית היינו שולחים את הנתונים לשרת
    this.messageService.add({
      severity: 'success',
      summary: 'ההגדרות נשמרו',
      detail: 'הגדרות העסק עודכנו בהצלחה'
    });
  }
} 