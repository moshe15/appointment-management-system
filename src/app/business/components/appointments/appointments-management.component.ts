import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-appointments-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TabViewModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    TooltipModule,
    DialogModule
  ],
  template: `
    <div class="container">
      <h1 class="text-center my-4">ניהול תורים</h1>
      
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3 mb-3">
          <p-card styleClass="h-full">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">תורים להיום</div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3 mb-3">
          <p-card styleClass="h-full">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">תורים למחר</div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3 mb-3">
          <p-card styleClass="h-full">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">תורים השבוע</div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3 mb-3">
          <p-card styleClass="h-full">
            <div class="stat-card">
              <div class="stat-value">0</div>
              <div class="stat-label">בקשות חדשות</div>
            </div>
          </p-card>
        </div>
      </div>
      
      <div class="filter-section mb-4">
        <div class="grid">
          <div class="col-12 md:col-3 mb-2">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input type="text" pInputText placeholder="חיפוש לקוח" class="w-full" />
            </span>
          </div>
          
          <div class="col-12 md:col-3 mb-2">
            <p-dropdown 
              [options]="statusOptions" 
              placeholder="סטטוס" 
              optionLabel="label"
              styleClass="w-full">
            </p-dropdown>
          </div>
          
          <div class="col-12 md:col-3 mb-2">
            <p-calendar 
              placeholder="מתאריך" 
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              styleClass="w-full">
            </p-calendar>
          </div>
          
          <div class="col-12 md:col-3 mb-2">
            <p-calendar 
              placeholder="עד תאריך" 
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              styleClass="w-full">
            </p-calendar>
          </div>
        </div>
      </div>
      
      <p-card>
        <p-tabView>
          <p-tabPanel header="יומן תורים">
            <div class="empty-state" *ngIf="true">
              <p>אין תורים קבועים כרגע.</p>
              <button pButton label="הוסף תור ידני" (click)="showAddAppointmentDialog()" class="p-button-outlined"></button>
            </div>
            
            <!-- הטבלה תוצג כאשר יש תורים -->
            <p-table [value]="[]" [hidden]="true" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>תאריך</th>
                  <th>שעה</th>
                  <th>שירות</th>
                  <th>לקוח</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-appointment>
                <tr>
                  <td>{{appointment.date}}</td>
                  <td>{{appointment.time}}</td>
                  <td>{{appointment.service}}</td>
                  <td>{{appointment.clientName}}</td>
                  <td>
                    <span class="status-badge" [class]="appointment.status">
                      {{appointment.statusText}}
                    </span>
                  </td>
                  <td>
                    <button pButton icon="pi pi-pencil" pTooltip="ערוך" class="p-button-text p-button-sm"></button>
                    <button pButton icon="pi pi-check" pTooltip="אשר" class="p-button-text p-button-success p-button-sm"></button>
                    <button pButton icon="pi pi-times" pTooltip="בטל" class="p-button-text p-button-danger p-button-sm"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>
          
          <p-tabPanel header="בקשות חדשות">
            <div class="empty-state">
              <p>אין בקשות חדשות לתורים</p>
            </div>
          </p-tabPanel>
          
          <p-tabPanel header="היסטוריה">
            <div class="empty-state">
              <p>אין היסטוריית תורים קודמים</p>
            </div>
          </p-tabPanel>
        </p-tabView>
      </p-card>
      
      <div class="mt-4">
        <button pButton label="חזרה לדשבורד" icon="pi pi-arrow-left" routerLink="/business" class="p-button-secondary"></button>
      </div>
    </div>
    
    <!-- דיאלוג הוספת תור ידני -->
    <p-dialog header="הוספת תור ידני" [(visible)]="addAppointmentDialogVisible" [style]="{width: '500px'}">
      <div class="manual-appointment-form">
        <div class="field">
          <label for="client">לקוח</label>
          <p-dropdown 
            [options]="clientOptions" 
            placeholder="בחר לקוח" 
            optionLabel="label"
            styleClass="w-full">
          </p-dropdown>
        </div>
        
        <div class="field">
          <label for="service">שירות</label>
          <p-dropdown 
            [options]="serviceOptions" 
            placeholder="בחר שירות" 
            optionLabel="label"
            styleClass="w-full">
          </p-dropdown>
        </div>
        
        <div class="field">
          <label for="date">תאריך</label>
          <p-calendar 
            dateFormat="dd/mm/yy"
            [showTime]="false"
            [showIcon]="true"
            styleClass="w-full">
          </p-calendar>
        </div>
        
        <div class="field">
          <label for="time">שעה</label>
          <p-dropdown 
            [options]="timeSlotOptions" 
            placeholder="בחר שעה" 
            optionLabel="label"
            styleClass="w-full">
          </p-dropdown>
        </div>
        
        <div class="field">
          <label for="notes">הערות</label>
          <textarea pInputTextarea rows="3" class="w-full" placeholder="הערות נוספות..."></textarea>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="שמור" icon="pi pi-check" (click)="addAppointmentDialogVisible = false" class="p-button-success"></button>
        <button pButton label="ביטול" icon="pi pi-times" (click)="addAppointmentDialogVisible = false" class="p-button-secondary"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .stat-card {
      text-align: center;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #3B82F6;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #666;
    }
    
    .empty-state p {
      margin-bottom: 20px;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .status-pending {
      background-color: #fff8e1;
      color: #f57c00;
    }
    
    .status-confirmed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-cancelled {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .field {
      margin-bottom: 1rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
    }
  `]
})
export class AppointmentsManagementComponent {
  addAppointmentDialogVisible = false;
  
  statusOptions = [
    { label: 'הכל', value: 'all' },
    { label: 'ממתין לאישור', value: 'pending' },
    { label: 'מאושר', value: 'confirmed' },
    { label: 'בוטל', value: 'cancelled' },
    { label: 'הושלם', value: 'completed' }
  ];
  
  clientOptions = [
    { label: 'ישראל ישראלי', value: '1' },
    { label: 'יעל כהן', value: '2' },
    { label: 'משה לוי', value: '3' }
  ];
  
  serviceOptions = [
    { label: 'תספורת גברים', value: '1' },
    { label: 'תספורת נשים', value: '2' },
    { label: 'צבע שיער', value: '3' },
    { label: 'פן', value: '4' }
  ];
  
  timeSlotOptions = [
    { label: '09:00', value: '09:00' },
    { label: '09:30', value: '09:30' },
    { label: '10:00', value: '10:00' },
    { label: '10:30', value: '10:30' },
    { label: '11:00', value: '11:00' },
    { label: '11:30', value: '11:30' },
    { label: '12:00', value: '12:00' }
  ];
  
  constructor(private authService: AuthService) {}
  
  showAddAppointmentDialog(): void {
    this.addAppointmentDialogVisible = true;
  }
} 