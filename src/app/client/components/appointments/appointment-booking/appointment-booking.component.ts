import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    StepsModule,
    MessageModule,
    RadioButtonModule
  ],
  template: `
    <div class="container">
      <h1 class="text-center my-4">קביעת תור חדש</h1>
      
      <p-steps [model]="bookingSteps" [activeIndex]="currentStep" [readonly]="false"></p-steps>
      
      <p-card styleClass="mt-4">
        <!-- שלב 1: בחירת עסק -->
        <div *ngIf="currentStep === 0">
          <h2>בחר עסק</h2>
          <p>בחר את העסק בו תרצה לקבוע תור:</p>
          
          <div class="business-list mt-4">
            <div class="business-card p-3 border-round mb-3" (click)="selectBusiness('1')">
              <div class="business-header">
                <h3>סלון יופי אלגנט</h3>
                <p>רחוב הרצל 35, תל אביב</p>
              </div>
              <div class="business-description">
                <p>סלון יופי מקצועי עם מגוון טיפולים לשיער ולציפורניים</p>
              </div>
            </div>
            
            <div class="business-card p-3 border-round mb-3" (click)="selectBusiness('2')">
              <div class="business-header">
                <h3>ד״ר ישראלי - רופא שיניים</h3>
                <p>רחוב ויצמן 78, רמת גן</p>
              </div>
              <div class="business-description">
                <p>מרפאת שיניים מתקדמת עם התמחות בטיפולי שיניים אסתטיים</p>
              </div>
            </div>
            
            <div class="business-card p-3 border-round mb-3" (click)="selectBusiness('3')">
              <div class="business-header">
                <h3>מכון עיסוי טבעי</h3>
                <p>רחוב בזל 12, הרצליה</p>
              </div>
              <div class="business-description">
                <p>מגוון טיפולי עיסוי והרפיה בסגנונות שונים</p>
              </div>
            </div>
          </div>
          
          <div class="navigation-buttons mt-4">
            <button pButton label="הבא" icon="pi pi-arrow-right" iconPos="right" 
                  [disabled]="!selectedBusinessId" 
                  (click)="nextStep()" 
                  class="p-button-primary"></button>
            <button pButton label="ביטול" routerLink="/client" class="p-button-secondary ml-2"></button>
          </div>
        </div>
        
        <!-- שלב 2: בחירת שירות -->
        <div *ngIf="currentStep === 1">
          <h2>בחירת שירות</h2>
          <p>בחר את השירות המבוקש:</p>
          
          <div class="service-list mt-4">
            <div class="grid">
              <div class="col-12 md:col-4 mb-3" *ngFor="let service of mockServices">
                <div class="service-card p-3 border-round" 
                    [class.selected]="selectedServiceId === service.id"
                    (click)="selectService(service.id)">
                  <h3>{{service.name}}</h3>
                  <p>{{service.duration}} דקות</p>
                  <p class="price">₪{{service.price}}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="navigation-buttons mt-4">
            <button pButton label="הבא" icon="pi pi-arrow-right" iconPos="right" 
                  [disabled]="!selectedServiceId" 
                  (click)="nextStep()" 
                  class="p-button-primary"></button>
            <button pButton label="חזור" icon="pi pi-arrow-left" (click)="prevStep()" class="p-button-secondary ml-2"></button>
          </div>
        </div>
        
        <!-- שלב 3: בחירת תאריך ושעה -->
        <div *ngIf="currentStep === 2">
          <h2>בחירת תאריך ושעה</h2>
          
          <div class="date-time-selection mt-4">
            <div class="grid">
              <div class="col-12 md:col-6 mb-3">
                <h3>בחר תאריך</h3>
                <p-calendar 
                  [minDate]="minDate" 
                  [showWeek]="true"
                  [readonlyInput]="true"
                  dateFormat="dd/mm/yy"
                  placeholder="בחר תאריך"
                  styleClass="w-full"
                  [disabledDays]="[0]"
                ></p-calendar>
              </div>
              
              <div class="col-12 md:col-6">
                <h3>בחר שעה</h3>
                <div class="time-slots mt-2">
                  <div class="grid">
                    <div class="col-4 mb-2" *ngFor="let slot of mockTimeSlots">
                      <div class="time-slot-card p-2 border-round text-center"
                          [class.selected]="selectedTimeSlot === slot"
                          [class.disabled]="slot.disabled"
                          (click)="!slot.disabled && selectTimeSlot(slot)">
                        {{slot.time}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="navigation-buttons mt-4">
            <button pButton label="הבא" icon="pi pi-arrow-right" iconPos="right" 
                  [disabled]="!selectedTimeSlot" 
                  (click)="nextStep()" 
                  class="p-button-primary"></button>
            <button pButton label="חזור" icon="pi pi-arrow-left" (click)="prevStep()" class="p-button-secondary ml-2"></button>
          </div>
        </div>
        
        <!-- שלב 4: סיכום ואישור -->
        <div *ngIf="currentStep === 3">
          <h2>אישור פרטי התור</h2>
          
          <div class="appointment-summary mt-4">
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="field">
                  <label>עסק:</label>
                  <p class="font-bold">סלון יופי אלגנט</p>
                </div>
                
                <div class="field">
                  <label>שירות:</label>
                  <p class="font-bold">תספורת גברים</p>
                </div>
                
                <div class="field">
                  <label>מחיר:</label>
                  <p class="font-bold">₪80</p>
                </div>
              </div>
              
              <div class="col-12 md:col-6">
                <div class="field">
                  <label>תאריך:</label>
                  <p class="font-bold">12/08/2023</p>
                </div>
                
                <div class="field">
                  <label>שעה:</label>
                  <p class="font-bold">14:30</p>
                </div>
                
                <div class="field">
                  <label>משך זמן:</label>
                  <p class="font-bold">30 דקות</p>
                </div>
              </div>
            </div>
            
            <div class="notes-section mt-3">
              <h3>הערות נוספות (אופציונלי)</h3>
              <textarea pInputTextarea rows="3" class="w-full" placeholder="הוסף הערות לבעל העסק..."></textarea>
            </div>
          </div>
          
          <div class="navigation-buttons mt-4">
            <button pButton label="אישור וקביעת תור" icon="pi pi-check" 
                  (click)="confirmBooking()" 
                  class="p-button-success"></button>
            <button pButton label="חזור" icon="pi pi-arrow-left" (click)="prevStep()" class="p-button-secondary ml-2"></button>
          </div>
        </div>
        
        <!-- שלב 5: אישור סופי -->
        <div *ngIf="currentStep === 4">
          <div class="confirmation-screen text-center p-5">
            <i class="pi pi-check-circle" style="font-size: 5rem; color: #4caf50;"></i>
            <h2 class="mt-3">התור נקבע בהצלחה!</h2>
            <p class="mt-2">קבלנו את הבקשה שלך לתור בתאריך 12/08/2023 בשעה 14:30</p>
            <p>בעל העסק יקבל את הפרטים וישלח אישור בהקדם.</p>
            
            <div class="mt-5">
              <button pButton label="חזרה לדשבורד" icon="pi pi-home" routerLink="/client" class="p-button-primary"></button>
              <button pButton label="צפייה בכל התורים" icon="pi pi-calendar" routerLink="/client/appointments" class="p-button-secondary ml-2"></button>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .business-card {
      border: 1px solid #e0e0e0;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .business-card:hover {
      border-color: #3B82F6;
      background-color: #f0f7ff;
    }
    
    .service-card {
      border: 1px solid #e0e0e0;
      height: 100%;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .service-card:hover, .service-card.selected {
      border-color: #3B82F6;
      background-color: #f0f7ff;
    }
    
    .service-card .price {
      font-weight: bold;
      color: #4CAF50;
    }
    
    .time-slot-card {
      border: 1px solid #e0e0e0;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .time-slot-card:hover:not(.disabled), .time-slot-card.selected {
      border-color: #3B82F6;
      background-color: #f0f7ff;
    }
    
    .time-slot-card.disabled {
      background-color: #f5f5f5;
      color: #9e9e9e;
      cursor: not-allowed;
    }
    
    .field {
      margin-bottom: 1rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      .navigation-buttons {
        display: flex;
        flex-direction: column-reverse;
      }
      
      .navigation-buttons button {
        margin: 5px 0;
      }
    }
  `]
})
export class AppointmentBookingComponent {
  bookingSteps = [
    { label: 'עסק' },
    { label: 'שירות' },
    { label: 'תאריך ושעה' },
    { label: 'אישור' }
  ];
  
  currentStep = 0;
  minDate = new Date();
  
  selectedBusinessId: string | null = null;
  selectedServiceId: string | null = null;
  selectedTimeSlot: any = null;
  
  mockServices = [
    { id: '1', name: 'תספורת גברים', duration: 30, price: 80 },
    { id: '2', name: 'תספורת נשים', duration: 60, price: 150 },
    { id: '3', name: 'צבע שיער', duration: 120, price: 200 },
    { id: '4', name: 'החלקת שיער', duration: 180, price: 350 },
    { id: '5', name: 'פן', duration: 30, price: 70 },
    { id: '6', name: 'תסרוקת ערב', duration: 90, price: 250 }
  ];
  
  mockTimeSlots = [
    { time: '09:00', disabled: false },
    { time: '09:30', disabled: true },
    { time: '10:00', disabled: false },
    { time: '10:30', disabled: false },
    { time: '11:00', disabled: true },
    { time: '11:30', disabled: false },
    { time: '12:00', disabled: false },
    { time: '12:30', disabled: false },
    { time: '13:00', disabled: true },
    { time: '13:30', disabled: false },
    { time: '14:00', disabled: false },
    { time: '14:30', disabled: false }
  ];
  
  constructor(private authService: AuthService) {}
  
  selectBusiness(businessId: string): void {
    this.selectedBusinessId = businessId;
  }
  
  selectService(serviceId: string): void {
    this.selectedServiceId = serviceId;
  }
  
  selectTimeSlot(slot: any): void {
    this.selectedTimeSlot = slot;
  }
  
  nextStep(): void {
    if (this.currentStep < this.bookingSteps.length) {
      this.currentStep++;
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  
  confirmBooking(): void {
    // כאן יתבצע שמירת התור במערכת
    // אחרי שמירה מוצלחת, עוברים לשלב האישור
    this.currentStep = 4;
  }
} 