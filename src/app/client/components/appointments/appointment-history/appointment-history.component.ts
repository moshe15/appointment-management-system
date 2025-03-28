import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';
import { AppointmentsDataService, Appointment } from '../../../../core/services/appointments-data.service';
import { RatingModule } from 'primeng/rating';
import { InputTextarea } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

// הגדרת ממשק למצבי תור
interface AppointmentStatus {
  label: string;
  value: string;
}

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    TagModule,
    RippleModule,
    DialogModule,
    ToastModule,
    AvatarModule,
    RatingModule,
    InputTextarea,
    MenuModule
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // הוספת סכמה מותאמת אישית עבור תכונות לא ידועות
  template: `
    <div class="appointment-history-container">
      <p-card>
        <ng-template pTemplate="title">
          <div class="card-header">
            <h2>היסטוריית תורים</h2>
            <p>צפה בתורים הקודמים שלך והוסף ביקורת</p>
          </div>
        </ng-template>
        
        <div class="filters-container mb-3">
          <div class="p-inputgroup search-input">
            <span class="p-inputgroup-addon">
              <i class="pi pi-search"></i>
            </span>
            <input
              pInputText
              type="text"
              [(ngModel)]="searchText"
              placeholder="חיפוש לפי שם עסק או שירות"
              (input)="applyFilters()"
            />
          </div>
          
          <div class="filter-options">
            <div class="date-filter">
              <p-calendar
                [(ngModel)]="fromDate"
                placeholder="מתאריך"
                [showIcon]="true"
                (onSelect)="applyFilters()"
                dateFormat="dd/mm/yy"
              ></p-calendar>
            </div>
            
            <div class="date-filter">
              <p-calendar
                [(ngModel)]="toDate"
                placeholder="עד תאריך"
                [showIcon]="true"
                (onSelect)="applyFilters()"
                dateFormat="dd/mm/yy"
              ></p-calendar>
            </div>
            
            <div class="status-filter">
              <p-dropdown
                [options]="statusOptions"
                [(ngModel)]="statusFilter"
                placeholder="סטטוס"
                (onChange)="applyFilters()"
                [showClear]="true"
              ></p-dropdown>
            </div>
          </div>
        </div>
        
        <p-table
          [value]="filteredAppointments"
          [paginator]="true"
          [rows]="5"
          [rowsPerPageOptions]="[5, 10, 20]"
          [tableStyle]="{ 'min-width': '50rem' }"
          [globalFilterFields]="['businessName', 'serviceName']"
          styleClass="p-datatable-gridlines p-datatable-sm"
          responsiveLayout="scroll"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="מציג {first} עד {last} מתוך {totalRecords} תורים"
          emptyMessage="לא נמצאו תורים בהיסטוריה"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>עסק</th>
              <th>שירות</th>
              <th>תאריך</th>
              <th>שעה</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-appointment>
            <tr>
              <td>{{ appointment.businessName }}</td>
              <td>{{ appointment.serviceName }}</td>
              <td>{{ appointment.date | date: 'dd/MM/yyyy' }}</td>
              <td>{{ appointment.startTime }}</td>
              <td>
                <p-tag
                  [value]="getStatusText(appointment.status)"
                  [severity]="getStatusClass(appointment.status)"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    pButton
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-text"
                    (click)="showDetails(appointment)"
                    title="צפה בפרטים"
                  ></button>
                  <button
                    pButton
                    *ngIf="canLeaveFeedback(appointment)"
                    icon="pi pi-comment"
                    class="p-button-rounded p-button-text p-button-success"
                    (click)="showFeedbackDialog(appointment)"
                    title="השאר משוב"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
    
    <!-- Dialog for appointment details -->
    <p-dialog
      header="פרטי תור"
      [(visible)]="detailsVisible"
      [style]="{ width: '50vw' }"
      [dismissableMask]="true"
      [draggable]="false"
      [modal]="true"
      [closeOnEscape]="true"
    >
      <div class="appointment-details" *ngIf="selectedAppointment">
        <div class="detail-row">
          <span class="detail-label">עסק:</span>
          <span class="detail-value">{{ selectedAppointment.businessName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">שירות:</span>
          <span class="detail-value">{{ selectedAppointment.serviceName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">תאריך:</span>
          <span class="detail-value">{{ selectedAppointment.date | date: 'dd/MM/yyyy' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">שעה:</span>
          <span class="detail-value">{{ selectedAppointment.startTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">סטטוס:</span>
          <span class="detail-value">
            <p-tag
              [value]="getStatusText(selectedAppointment.status)"
              [severity]="getStatusClass(selectedAppointment.status)"
            ></p-tag>
          </span>
        </div>
        <div class="detail-row" *ngIf="selectedAppointment.stylistName">
          <span class="detail-label">מטפל/ת:</span>
          <span class="detail-value">{{ selectedAppointment.stylistName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">מחיר:</span>
          <span class="detail-value">₪{{ selectedAppointment.price }}</span>
        </div>
        <div class="detail-row" *ngIf="selectedAppointment.feedback">
          <span class="detail-label">המשוב שלך:</span>
          <div class="feedback-info">
            <p-rating
              [ngModel]="selectedAppointment.rating"
              [readonly]="true"
              [cancel]="false"
            ></p-rating>
            <p class="feedback-text">{{ selectedAppointment.feedback }}</p>
          </div>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button
          pButton
          label="סגור"
          class="p-button-text"
          (click)="detailsVisible = false"
        ></button>
      </ng-template>
    </p-dialog>
    
    <!-- Dialog for leaving feedback -->
    <p-dialog
      header="השאר משוב"
      [(visible)]="feedbackVisible"
      [style]="{ width: '40vw' }"
      [dismissableMask]="true"
      [draggable]="false"
      [modal]="true"
      [closeOnEscape]="true"
    >
      <div class="feedback-form" *ngIf="selectedAppointment">
        <div class="appointment-summary">
          <p>
            <strong>עסק:</strong> {{ selectedAppointment.businessName }}
          </p>
          <p>
            <strong>שירות:</strong> {{ selectedAppointment.serviceName }}
          </p>
          <p>
            <strong>תאריך:</strong> {{ selectedAppointment.date | date: 'dd/MM/yyyy' }} בשעה {{ selectedAppointment.startTime }}
          </p>
        </div>
        
        <div class="rating-container mt-3 mb-3">
          <label for="rating">דרג את החוויה שלך:</label>
          <p-rating
            [(ngModel)]="feedbackRating"
            [cancel]="false"
            id="rating"
          ></p-rating>
        </div>
        
        <div class="feedback-textarea">
          <label for="feedback">המשוב שלך:</label>
          <textarea
            pInputTextarea
            [(ngModel)]="feedbackComment"
            [rows]="5"
            [cols]="30"
            placeholder="שתף את החוויה שלך..."
            id="feedback"
            class="w-full"
          ></textarea>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button
          pButton
          label="שלח משוב"
          class="p-button-success"
          [disabled]="!feedbackRating"
          (click)="submitFeedback()"
        ></button>
        <button
          pButton
          label="ביטול"
          class="p-button-text"
          (click)="feedbackVisible = false"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .appointment-history-container {
      padding: 20px;
    }
    
    .card-header {
      margin-bottom: 20px;
    }
    
    .card-header h2 {
      margin-bottom: 5px;
    }
    
    .card-header p {
      color: #6c757d;
      margin: 0;
    }
    
    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .search-input {
      max-width: 400px;
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .date-filter, .status-filter {
      min-width: 200px;
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-start;
      gap: 0.5rem;
    }
    
    .appointment-details {
      padding: 10px;
    }
    
    .detail-row {
      margin-bottom: 15px;
      display: flex;
      align-items: flex-start;
    }
    
    .detail-label {
      min-width: 100px;
      font-weight: 600;
      color: #495057;
    }
    
    .detail-value {
      color: #212529;
    }
    
    .feedback-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .feedback-text {
      font-style: italic;
      margin: 0;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .appointment-summary {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .rating-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .feedback-textarea {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    @media screen and (min-width: 768px) {
      .filters-container {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      
      .search-input {
        width: 300px;
      }
    }
  `
})
export class AppointmentHistoryComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading$ = new BehaviorSubject<boolean>(true);
  
  // פרטי פילטרים
  fromDate: Date | null = null;
  toDate: Date | null = null;
  statusFilter: string | null = null;
  searchText: string = '';
  
  // שליפת נתוני תור
  selectedAppointment: Appointment | null = null;
  detailsVisible: boolean = false;
  
  // משוב לתור
  feedbackVisible: boolean = false;
  feedbackRating: number = 0;
  feedbackComment: string = '';
  
  statusOptions: AppointmentStatus[] = [
    { label: 'הושלם', value: 'completed' },
    { label: 'מבוטל', value: 'canceled' },
    { label: 'אושר', value: 'confirmed' },
    { label: 'ממתין לאישור', value: 'pending' }
  ];
  
  constructor(
    private appointmentsService: AppointmentsDataService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this.loadAppointmentHistory();
  }
  
  loadAppointmentHistory(): void {
    this.loading$.next(true);
    this.appointmentsService.getAppointmentHistory().subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.filteredAppointments = [...this.appointments];
        this.loading$.next(false);
      },
      error: (err: Error) => {
        console.error('שגיאה בטעינת היסטוריית תורים:', err);
        this.loading$.next(false);
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // סינון לפי טקסט חופשי
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(app => 
        app.businessName.toLowerCase().includes(searchLower) ||
        app.serviceName.toLowerCase().includes(searchLower) ||
        app.serviceCategory.toLowerCase().includes(searchLower)
      );
    }
    
    // סינון לפי תאריך התחלה
    if (this.fromDate) {
      const fromDateObj = new Date(this.fromDate);
      fromDateObj.setHours(0, 0, 0, 0);
      filtered = filtered.filter(app => new Date(app.date) >= fromDateObj);
    }
    
    // סינון לפי תאריך סיום
    if (this.toDate) {
      const toDateObj = new Date(this.toDate);
      toDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter(app => new Date(app.date) <= toDateObj);
    }
    
    // סינון לפי סטטוס
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }
    
    this.filteredAppointments = filtered;
  }
  
  clearFilters(): void {
    this.searchText = '';
    this.fromDate = null;
    this.toDate = null;
    this.statusFilter = null;
    this.filteredAppointments = [...this.appointments];
  }
  
  showDetails(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.detailsVisible = true;
  }
  
  showFeedbackDialog(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.feedbackRating = appointment.rating || 0;
    this.feedbackComment = appointment.feedback || '';
    this.feedbackVisible = true;
  }
  
  submitFeedback(): void {
    if (!this.selectedAppointment || !this.feedbackRating) return;
    
    const updatedAppointment = {
      ...this.selectedAppointment,
      rating: this.feedbackRating,
      feedback: this.feedbackComment
    };
    
    this.appointmentsService.updateAppointment(this.selectedAppointment.id, {
      rating: this.feedbackRating,
      feedback: this.feedbackComment
    }).subscribe({
      next: (result) => {
        // Update the appointment in the list
        const index = this.appointments.findIndex(a => a.id === this.selectedAppointment!.id);
        if (index !== -1) {
          this.appointments[index] = {
            ...this.appointments[index],
            rating: this.feedbackRating,
            feedback: this.feedbackComment
          };
          this.applyFilters(); // Refresh the filtered list
        }
        
        this.feedbackVisible = false;
        this.feedbackRating = 0;
        this.feedbackComment = '';
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
      }
    });
  }
  
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'הושלם';
      case 'cancelled': return 'בוטל';
      case 'pending': return 'ממתין';
      case 'scheduled': return 'מתוזמן';
      default: return status;
    }
  }
  
  getStatusClass(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'completed': return "success";
      case 'cancelled': return "danger";
      case 'pending': return "warn";
      case 'scheduled': return "info";
      default: return "secondary";
    }
  }
  
  canLeaveFeedback(appointment: any): boolean {
    return appointment.status === 'completed' && !appointment.hasFeedback;
  }
}